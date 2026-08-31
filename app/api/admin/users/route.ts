import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || 15)));
    const search = url.searchParams.get('search') || '';
    const role = url.searchParams.get('role') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const sort = url.searchParams.get('sort') || 'newest';

    const where: Record<string, unknown> = {};
    if (role) where.role = role.toUpperCase();
    if (status) where.status = status.toUpperCase();
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'name') orderBy = { name: 'asc' };
    if (sort === 'email') orderBy = { email: 'asc' };

    const [users, total, allOrders] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
      prisma.order.findMany(),
    ]);

    const ordersByUser = new Map<string, { count: number; spent: number }>();
    for (const o of allOrders) {
      if (!o.userId) continue;
      const cur = ordersByUser.get(o.userId) ?? { count: 0, spent: 0 };
      cur.count += 1;
      if (o.status === 'COMPLETED') cur.spent += o.totalPrice;
      ordersByUser.set(o.userId, cur);
    }

    return ok({
      users: users.map((u) => {
        const stats = ordersByUser.get(u.id) ?? { count: 0, spent: 0 };
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role.toLowerCase(),
          status: u.status.toLowerCase(),
          avatar: u.avatar,
          lastLogin: u.lastLogin?.toISOString() ?? null,
          orderCount: stats.count,
          totalSpent: stats.spent,
          createdAt: u.createdAt.toISOString(),
          updatedAt: u.updatedAt.toISOString(),
        };
      }),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}