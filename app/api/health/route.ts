import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [users, projects, orders, dbCheck] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.order.count(),
      prisma.$queryRaw`SELECT 1 AS ok`,
    ]);

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: Array.isArray(dbCheck) && dbCheck[0]?.ok === 1 ? 'connected' : 'unknown',
      counts: { users, projects, orders },
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: err instanceof Error ? err.message : 'unknown',
      },
      { status: 500 },
    );
  }
}