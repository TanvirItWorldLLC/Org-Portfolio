import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest, signToken, setAuthCookie } from '@/lib/auth';
import { z } from 'zod';

const profileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) return unauthorized();

    const body = await req.json();
    const data = profileSchema.parse(body);

    if (data.email && data.email !== user.email) {
      const taken = await prisma.user.findUnique({ where: { email: data.email } });
      if (taken) return ok({ error: 'Email already in use' }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.userId },
      data,
    });

    // Re-issue token (in case role/status changed; harmless otherwise)
    const token = await signToken({
      userId: updated.id,
      email: updated.email,
      role: updated.role,
      status: updated.status,
    });
    await setAuthCookie(token);

    return ok({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role.toLowerCase(),
        status: updated.status.toLowerCase(),
        avatar: updated.avatar,
        createdAt: updated.createdAt.toISOString(),
        lastLogin: updated.lastLogin?.toISOString() ?? null,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}