/**
 * End-to-end DB smoke test against Prisma Postgres.
 *
 * Exercises every prisma.* call the Next.js app uses (auth, portfolio,
 * orders, admin), validates shape, and prints results.
 *
 * Run with: DATABASE_URL=... PRISMA_FORCE_LOCAL=1 tsx scripts/smoke-db.ts
 */
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const COLORS = { ok: '\x1b[32m', fail: '\x1b[31m', info: '\x1b[36m', dim: '\x1b[90m', reset: '\x1b[0m' };

let passed = 0;
let failed = 0;

function pass(name: string, info?: unknown) {
  passed++;
  console.log(`  ${COLORS.ok}✓${COLORS.reset} ${name}${info ? COLORS.dim + ' ' + JSON.stringify(info).slice(0, 100) + COLORS.reset : ''}`);
}
function fail(name: string, err: unknown) {
  failed++;
  console.log(`  ${COLORS.fail}✗${COLORS.reset} ${name}\n      ${COLORS.fail}${err instanceof Error ? err.message : String(err)}${COLORS.reset}`);
}

async function check(name: string, fn: () => Promise<unknown>) {
  try { await fn(); pass(name); }
  catch (e) { fail(name, e); }
}

async function main() {
  console.log(`${COLORS.info}═══ Org Portfolio — DB integration smoke test ═══${COLORS.reset}`);
  console.log(`${COLORS.dim}Connected to: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':***@')}${COLORS.reset}\n`);

  // ─── Health & counts ───────────────────────────────────────────────────
  console.log(`${COLORS.info}1. Raw counts${COLORS.reset}`);
  await check('count users',    async () => { const n = await prisma.user.count();    if (n < 1) throw new Error('no users'); });
  await check('count categories', async () => { const n = await prisma.category.count(); if (n < 4) throw new Error('need ≥4'); });
  await check('count projects',  async () => { const n = await prisma.project.count();  if (n < 3) throw new Error('need ≥3'); });
  await check('count orders',    async () => { const n = await prisma.order.count();    if (n < 0) throw new Error('?'); });

  // ─── Auth flow ─────────────────────────────────────────────────────────
  console.log(`\n${COLORS.info}2. Auth (login + me + profile + password)${COLORS.reset}`);

  await check('user.findUnique by email', async () => {
    const u = await prisma.user.findUnique({ where: { email: 'admin@orgportfolio.com' } });
    if (!u) throw new Error('admin not found');
    if (u.role !== 'admin') throw new Error(`role=${u.role}`);
  });

  await check('bcrypt verify default admin password', async () => {
    const u = await prisma.user.findUnique({ where: { email: 'admin@orgportfolio.com' } });
    if (!u) throw new Error('admin missing');
    const ok = await bcrypt.compare('admin123', u.password);
    if (!ok) throw new Error('password mismatch');
    pass('verify', { passwordHashPrefix: u.password.slice(0, 7) });
  });

  await check('user.update (lastLogin)', async () => {
    const u = await prisma.user.findUnique({ where: { email: 'admin@orgportfolio.com' } });
    if (!u) throw new Error('admin missing');
    const updated = await prisma.user.update({ where: { id: u.id }, data: { lastLogin: new Date() } });
    if (!updated.lastLogin) throw new Error('lastLogin not set');
  });

  await check('user.upsert (idempotent)', async () => {
    const before = await prisma.user.count();
    await prisma.user.upsert({
      where: { email: 'admin@orgportfolio.com' },
      update: {},
      create: { email: 'admin@orgportfolio.com', password: 'x', name: 'X', role: 'ADMIN', status: 'ACTIVE' },
    });
    const after = await prisma.user.count();
    if (after !== before) throw new Error(`count changed ${before} → ${after}`);
  });

  // ─── Public portfolio ──────────────────────────────────────────────────
  console.log(`\n${COLORS.info}3. Public portfolio (home + portfolio + project detail)${COLORS.reset}`);

  await check('project.findMany PUBLISHED', async () => {
    const projects = await prisma.project.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });
    if (projects.length < 3) throw new Error(`only ${projects.length}`);
    for (const p of projects) {
      if (!p.title || !p.slug) throw new Error('bad shape');
      if (!Array.isArray(p.technologies)) throw new Error('tech not array');
      if (!Array.isArray(p.tags)) throw new Error('tags not array');
    }
    pass('list', { count: projects.length, featured: projects.filter((p: { featured: boolean }) => p.featured).length });
  });

  await check('category.findMany ordered', async () => {
    const cats = await prisma.category.findMany({ orderBy: { name: 'asc' } });
    if (cats.length < 4) throw new Error(`only ${cats.length}`);
    const names = cats.map((c: { name: string }) => c.name);
    if (!names.includes('Web Experiences')) throw new Error('missing web');
  });

  await check('project.findUnique by slug (Aether)', async () => {
    const p = await prisma.project.findUnique({ where: { slug: 'aether-3d-portfolio' } });
    if (!p) throw new Error('not found');
    if (!p.color || !p.color.startsWith('#')) throw new Error('bad color');
  });

  await check('project.findUnique by id with category', async () => {
    const list = await prisma.project.findMany({ where: { status: 'PUBLISHED' }, take: 1 }) as Array<{ id: string }>;
    const id = list[0].id;
    const p = await prisma.project.findUnique({ where: { id } });
    if (!p || !(p as { category: unknown }).category) throw new Error('category missing on detail page');
  });

  // ─── Order creation flow ──────────────────────────────────────────────
  console.log(`\n${COLORS.info}4. Orders (public POST + admin list)${COLORS.reset}`);

  let createdOrderId = '';
  let createdOrderNumber = '';
  await check('order.create (public order wizard)', async () => {
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-TEST`;
    const o = await prisma.order.create({
      data: {
        orderNumber,
        projectType: 'portfolio',
        plan: 'professional',
        totalPrice: 7500,
        status: 'PENDING',
        projectDetails: { title: 'Smoke test project', description: 'E2E test', requirements: '', referenceUrls: '', deadline: '' },
        contactInfo: { name: 'Smoke Tester', email: 'tester@example.com', company: 'TestCo', phone: '+1-555-0100', preferredContact: 'email' },
        notes: 'created by smoke test',
      } as never,
    } as never);
    createdOrderId = (o as { id: string }).id;
    createdOrderNumber = (o as { orderNumber: string }).orderNumber;
    if ((o as { status: string }).status !== 'pending') throw new Error('status not lowered');
  });

  await check('order.findUnique by id (admin detail modal)', async () => {
    const o = await prisma.order.findUnique({ where: { id: createdOrderId } });
    if (!o) throw new Error('missing');
    if (o.totalPrice !== 7500) throw new Error(`price=${o.totalPrice}`);
  });

  await check('order.update status → CONFIRMED', async () => {
    await prisma.order.update({ where: { id: createdOrderId }, data: { status: 'CONFIRMED' } });
  });

  await check('order.findMany admin (paginated)', async () => {
    const list = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 15 });
    if (!list.find((o: { id: string }) => o.id === createdOrderId)) throw new Error('not in list');
  });

  // ─── Admin stats ──────────────────────────────────────────────────────
  console.log(`\n${COLORS.info}5. Admin stats${COLORS.reset}`);

  await check('aggregate counts for dashboard', async () => {
    const users = await prisma.user.count();
    const projects = await prisma.project.count();
    const orders = await prisma.order.count();
    pass('list', { users, projects, orders });
  });

  // ─── Settings ─────────────────────────────────────────────────────────
  console.log(`\n${COLORS.info}6. Settings (singleton upsert)${COLORS.reset}`);

  await check('setting.upsert (idempotent)', async () => {
    const s = await prisma.setting.upsert({
      where: { id: 'default' },
      update: { primaryColor: '#ff0066' },
      create: { id: 'default' },
    });
    if (s.primaryColor !== '#ff0066') throw new Error('color not applied');
    await prisma.setting.upsert({
      where: { id: 'default' },
      update: { primaryColor: '#0ea5e9' },
      create: { id: 'default' },
    });
  });

  // ─── Cleanup ──────────────────────────────────────────────────────────
  console.log(`\n${COLORS.info}7. Cleanup test artifacts${COLORS.reset}`);
  await check(`order.delete ${createdOrderNumber}`, async () => {
    await prisma.order.delete({ where: { id: createdOrderId } });
    const o = await prisma.order.findUnique({ where: { id: createdOrderId } });
    if (o) throw new Error('still exists');
  });

  console.log(`\n${COLORS.info}═══ ${passed} passed, ${failed} failed ═══${COLORS.reset}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error('FATAL', e);
  process.exit(1);
});