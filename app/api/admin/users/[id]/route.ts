import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, notFound, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const patchSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(_req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const u = await prisma.user.findUnique({ where: { id: params.id } });
    if (!u) return notFound('User not found');

    const orders = await prisma.order.findMany({
      where: { userId: u.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return ok({
      user: {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role.toLowerCase(),
        status: u.status.toLowerCase(),
        avatar: u.avatar,
        lastLogin: u.lastLogin?.toISOString() ?? null,
        orderCount: orders.length,
        totalSpent: orders.filter((o) => o.status === 'COMPLETED').reduce((s, o) => s + o.totalPrice, 0),
        createdAt: u.createdAt.toISOString(),
        orders: orders.map((o) => ({
          id: o.id,
          orderId: o.orderNumber,
          projectType: o.projectType,
          plan: o.plan,
          totalPrice: o.totalPrice,
          status: o.status.toLowerCase(),
          projectDetails: o.projectDetails,
          contactInfo: o.contactInfo,
          createdAt: o.createdAt.toISOString(),
        })),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('User not found');

    const body = await req.json();
    const data = patchSchema.parse(body);

    if (data.email && data.email !== existing.email) {
      const taken = await prisma.user.findUnique({ where: { email: data.email } });
      if (taken) return ok({ error: 'Email already in use' }, { status: 400 });
    }

    const updated = await prisma.user.update({ where: { id: params.id }, data });
    return ok({
      user: {
        ...updated,
        role: updated.role.toLowerCase(),
        status: updated.status.toLowerCase(),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
        lastLogin: updated.lastLogin?.toISOString() ?? null,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    if (user.userId === params.id) {
      return ok({ error: 'Cannot delete your own account' }, { status: 400 });
    }
    const existing = await prisma.user.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('User not found');

    await prisma.user.delete({ where: { id: params.id } });
    return ok({ message: 'User deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}