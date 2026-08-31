import { NextRequest } from 'next/server';
import { ok } from '@/lib/api';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(_req: NextRequest) {
  await clearAuthCookie();
  return ok({ message: 'Logged out' });
}