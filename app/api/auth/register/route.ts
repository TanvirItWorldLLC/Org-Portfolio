import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  handleApiError,
  ok,
  unauthorized,
} from '@/lib/api';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = registerSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return ok({ error: 'Email already registered' }, { status: 400 });
    }

    const { hashPassword, signToken, setAuthCookie } = await import('@/lib/auth');

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        role: 'USER',
        status: 'ACTIVE',
      },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    await setAuthCookie(token);

    return ok(
      {
        token,
        user: publicUser(user),
      },
      { status: 201 },
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export function publicUser(u: {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  avatar: string | null;
  createdAt: Date;
  lastLogin: Date | null;
}) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role.toLowerCase(),
    status: u.status.toLowerCase(),
    avatar: u.avatar,
    createdAt: u.createdAt.toISOString(),
    lastLogin: u.lastLogin?.toISOString() ?? null,
  };
}