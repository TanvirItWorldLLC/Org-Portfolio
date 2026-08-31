import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  generateOrderNumber,
  handleApiError,
  ok,
  unauthorized,
} from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const orderInputSchema = z.object({
  projectType: z.string().min(1),
  plan: z.string().min(1),
  totalPrice: z.number().int().min(0),
  projectDetails: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    requirements: z.string().optional(),
    referenceUrls: z.string().optional(),
    deadline: z.string().optional(),
  }),
  contactInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    company: z.string().optional(),
    phone: z.string().optional(),
    preferredContact: z.enum(['email', 'phone']).optional(),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = orderInputSchema.parse(body);

    const user = await getCurrentUserFromRequest(req);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        projectType: data.projectType,
        plan: data.plan,
        totalPrice: data.totalPrice,
        status: 'PENDING',
        projectDetails: data.projectDetails as unknown as object,
        contactInfo: data.contactInfo as unknown as object,
        userId: user?.userId ?? null,
      },
    });

    return ok({ order: serializeOrder(order) }, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) return unauthorized();

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit') || 15)));
    const search = url.searchParams.get('search') || '';
    const status = url.searchParams.get('status') || undefined;
    const sort = url.searchParams.get('sort') || 'newest';

    const where: Record<string, unknown> = {};
    if (user.role !== 'ADMIN') where.userId = user.userId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { projectType: { contains: search } },
      ];
    }

    let orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' };
    if (sort === 'oldest') orderBy = { createdAt: 'asc' };
    if (sort === 'amount') orderBy = { totalPrice: 'desc' };
    if (sort === 'status') orderBy = { status: 'asc' };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return ok({
      orders: orders.map(serializeOrder),
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

export function serializeOrder(o: {
  id: string;
  orderNumber: string;
  projectType: string;
  plan: string;
  totalPrice: number;
  status: string;
  projectDetails: unknown;
  contactInfo: unknown;
  userId: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: o.id,
    orderId: o.orderNumber,
    projectType: o.projectType,
    plan: o.plan,
    totalPrice: o.totalPrice,
    status: o.status.toLowerCase(),
    projectDetails: o.projectDetails ?? {},
    contactInfo: o.contactInfo ?? {},
    userId: o.userId,
    notes: o.notes,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}