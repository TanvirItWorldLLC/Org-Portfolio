import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, notFound, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  color: z.string().optional(),
  icon: z.string().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('Category not found');

    const body = await req.json();
    const data = patchSchema.parse(body);

    const updated = await prisma.category.update({ where: { id: params.id }, data });
    return ok({
      category: { ...updated, createdAt: updated.createdAt.toISOString(), updatedAt: updated.updatedAt.toISOString() },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(_req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const existing = await prisma.category.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('Category not found');

    await prisma.category.delete({ where: { id: params.id } });
    return ok({ message: 'Category deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}