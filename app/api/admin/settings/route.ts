import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, ok, unauthorized } from '@/lib/api';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const settingsSchema = z.object({
  siteName: z.string().optional(),
  siteDescription: z.string().optional().nullable(),
  siteUrl: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  darkMode: z.string().optional(),
  emailNewOrder: z.string().optional(),
  emailOrderUpdates: z.string().optional(),
  emailNewUser: z.string().optional(),
  twoFactorAuth: z.string().optional(),
  sessionTimeout: z.number().int().optional(),
  maxLoginAttempts: z.number().int().optional(),
  passwordMinLength: z.number().int().optional(),
  apiRateLimit: z.number().int().optional(),
  apiEnabled: z.string().optional(),
  maintenanceMode: z.string().optional(),
  logRetention: z.number().int().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const s = await prisma.setting.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });

    return ok({ settings: serializeSettings(s) });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') return unauthorized('Admin access required');

    const body = await req.json();
    const incoming = settingsSchema.parse(body.settings ?? body);

    const s = await prisma.setting.upsert({
      where: { id: 'default' },
      update: incoming,
      create: { id: 'default', ...incoming },
    });
    return ok({ settings: serializeSettings(s) });
  } catch (err) {
    return handleApiError(err);
  }
}

function serializeSettings(s: Record<string, unknown>) {
  return {
    ...s,
    createdAt: (s.createdAt as Date | undefined)?.toISOString?.() ?? s.createdAt,
    updatedAt: (s.updatedAt as Date | undefined)?.toISOString?.() ?? s.updatedAt,
  };
}