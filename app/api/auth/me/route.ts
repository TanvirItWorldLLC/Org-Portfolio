import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, notFound, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user) return unauthorized();

    const full = await prisma.user.findUnique({ where: { id: user.userId } });
    if (!full) return notFound('User not found');

    return ok({
      user: {
        id: full.id,
        name: full.name,
        email: full.email,
        role: full.role.toLowerCase(),
        status: full.status.toLowerCase(),
        avatar: full.avatar,
        createdAt: full.createdAt.toISOString(),
        lastLogin: full.lastLogin?.toISOString() ?? null,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}