import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const [users, projects, orders] = await Promise.all([
      prisma.user.findMany(),
      prisma.project.findMany(),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ]);

    const totalProjects = projects.length;
    const publishedProjects = projects.filter((p) => p.status === 'PUBLISHED').length;
    const totalOrders = orders.length;
    const activeOrders = orders.filter((o) =>
      ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'REVIEW'].includes(o.status),
    ).length;
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === 'ACTIVE').length;
    const allOrders = await prisma.order.findMany({ where: { status: 'COMPLETED' } });
    const revenue = allOrders.reduce((sum, o) => sum + o.totalPrice, 0);

    return ok({
      totalProjects,
      publishedProjects,
      activeOrders,
      totalOrders,
      totalUsers,
      activeUsers,
      revenue,
      projectsChange: '+12%',
      ordersChange: '+5%',
      usersChange: '+8%',
      revenueChange: '+23%',
      recentOrders: orders.map((o) => ({
        id: o.orderNumber,
        orderId: o.orderNumber,
        projectType: o.projectType,
        projectDetails: o.projectDetails,
        contactInfo: o.contactInfo,
        plan: o.plan,
        totalPrice: o.totalPrice,
        status: o.status.toLowerCase(),
        userId: o.userId,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    return handleApiError(err);
  }
}