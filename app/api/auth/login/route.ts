import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, unauthorized } from '@/lib/api';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return unauthorized('Invalid credentials');

    if (user.status !== 'ACTIVE') return unauthorized('Account is deactivated');

    const { verifyPassword, signToken, setAuthCookie } = await import('@/lib/auth');
    const okPwd = await verifyPassword(password, user.password);
    if (!okPwd) return unauthorized('Invalid credentials');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    });
    await setAuthCookie(token);

    return ok({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
        status: user.status.toLowerCase(),
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}