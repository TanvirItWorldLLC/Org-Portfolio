import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, notFound, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest, hashPassword, verifyPassword } from '@/lib/auth';
import { z } from 'zod';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) return unauthorized();

    const body = await req.json();
    const { currentPassword, newPassword } = schema.parse(body);

    const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!dbUser) return notFound('User not found');

    const okPwd = await verifyPassword(currentPassword, dbUser.password);
    if (!okPwd) return ok({ error: 'Current password is incorrect' }, { status: 400 });

    const hashed = await hashPassword(newPassword);
    await prisma.user.update({ where: { id: user.userId }, data: { password: hashed } });

    return ok({ message: 'Password updated successfully' });
  } catch (err) {
    return handleApiError(err);
  }
}