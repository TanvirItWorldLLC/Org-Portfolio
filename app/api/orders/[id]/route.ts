import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  forbidden,
  handleApiError,
  notFound,
  ok,
  unauthorized,
} from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import { serializeOrder } from '../route';

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED']),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) return unauthorized();

    const order = await prisma.order.findUnique({ where: { id: params.id } });
    if (!order) return notFound('Order not found');

    if (user.role !== 'ADMIN' && order.userId !== user.userId) {
      return forbidden('Access denied');
    }

    return ok({ order: serializeOrder(order) });
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

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('Order not found');

    await prisma.order.delete({ where: { id: params.id } });
    return ok({ message: 'Order deleted successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const body = await req.json();
    const { status } = statusSchema.parse(body);

    const existing = await prisma.order.findUnique({ where: { id: params.id } });
    if (!existing) return notFound('Order not found');

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });
    return ok({ order: serializeOrder(updated) });
  } catch (err) {
    return handleApiError(err);
  }
}