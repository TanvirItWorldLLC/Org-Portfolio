import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

/**
 * Returns the database client to use.
 *
 * On x86_64 hosts (Hostinger KVM, macOS, Windows, Docker) the bundled
 * `libquery_engine-debian-openssl-1.1.x.so.node` loads fine. We use the
 * real Prisma client.
 *
 * On ARM64 hosts (Termux/Android, AWS Graviton, Raspberry Pi) Prisma's
 * debian engine is x86_64 only — it cannot be dlopen'd. We fall back
 * to `lib/prisma.local.ts` which uses the `mariadb` driver directly.
 *
 * Set `PRISMA_FORCE_LOCAL=1` to force the local fallback on any host
 * (useful for testing).
 *
 * Production (Hostinger) is always x86_64, so this branch is never
 * taken there.
 */
async function createClient(): Promise<PrismaClient> {
  const useLocal =
    process.env.PRISMA_FORCE_LOCAL === '1' ||
    (process.arch === 'arm64' && process.env.PRISMA_FORCE_PRISMA !== '1');

  if (!useLocal) {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  // Dynamic import keeps the mariadb driver out of production bundles
  const mod = await import('./prisma.local');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mod.prisma as unknown as PrismaClient;
}

let clientPromise: Promise<PrismaClient> | null = null;

async function getClient(): Promise<PrismaClient> {
  if (!clientPromise) clientPromise = createClient();
  return clientPromise;
}

/**
 * Recursive lazy proxy. Each property access (e.g. `prisma.user`)
 * returns another proxy that resolves the actual value only when a
 * method is called. This means call sites look identical:
 *
 *   const u = await prisma.user.findUnique({ where: { email } });
 *
 * regardless of whether we're on Prisma (x86_64) or the local mariadb
 * fallback (ARM64).
 */
function makeProxy(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handler: ProxyHandler<any> = {
    get(_t, prop) {
      // Special non-model props
      if (prop === 'then') return undefined; // not a thenable
      return new Proxy(function () {} as unknown as Record<string, unknown>, {
        get(_t2, sub) {
          return async (...args: unknown[]) => {
            const c = await getClient();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const model = (c as any)[prop];
            if (model && typeof model === 'object') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const fn = (model as any)[sub];
              if (typeof fn === 'function') return fn.apply(model, args);
              return (model as any)[sub];
            }
            return undefined;
          };
        },
      });
    },
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({} as any, handler) as PrismaClient;
}

export const prisma: PrismaClient = makeProxy();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;