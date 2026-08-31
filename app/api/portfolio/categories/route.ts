import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const categorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  color: z.string().optional(),
  icon: z.string().optional().nullable(),
});

export async function GET() {
  try {
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    return ok({
      categories: cats.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        color: c.color,
        icon: c.icon,
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const body = await req.json();
    const data = categorySchema.parse(body);

    const cat = await prisma.category.create({ data });
    return ok(
      { category: { ...cat, createdAt: cat.createdAt.toISOString(), updatedAt: cat.updatedAt.toISOString() } },
      { status: 201 },
    );
  } catch (err) {
    return handleApiError(err);
  }
}