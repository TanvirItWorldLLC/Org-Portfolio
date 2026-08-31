/**
 * Local ARM64/dev fallback for Termux, Raspberry Pi, AWS Graviton, etc.
 *
 * Why this exists: Prisma 5.x ships its query engine as a native ELF binary.
 * npm only publishes the x86_64 engine for Linux Debian — the ARM64 engine is
 * fetched lazily at install from Prisma's CDN only when `binaryTargets`
 * includes a matching target AND the runtime resolves to that target.
 *
 * On Termux/Android, `@prisma/get-platform` reports the target as
 * `debian-openssl-1.1.x` (it ignores the actual `aarch64 CPU` because Android
 * is mapped to "debian" for compatibility). So even when we ship
 * `linux-arm64-openssl-1.1.x.so.node` next to `debian-openssl-1.1.x.so.node`,
 * Prisma's runtime picks the debian one — which is x86_64 — and dlopen fails.
 *
 * On production (Hostinger KVM x86_64) this file is never imported; the
 * real `prisma.ts` (using `@prisma/client`) is used instead.
 *
 * Supports both `postgres://` and `mysql://` URLs automatically.
 */
import { Pool as PgPool } from 'pg';
import mariadb from 'mariadb';

let pgPool: PgPool | null = null;
let mysqlPool: mariadb.Pool | null = null;
let dbKind: 'postgres' | 'mysql' | null = null;

function detect(url: string): 'postgres' | 'mysql' {
  if (url.startsWith('postgres://') || url.startsWith('postgresql://')) return 'postgres';
  if (url.startsWith('mysql://') || url.startsWith('mariadb://')) return 'mysql';
  throw new Error(`Unsupported DATABASE_URL scheme: ${url.slice(0, 20)}…`);
}

/**
 * Postgres uses $1, $2, … placeholders. MySQL/MariaDB uses ?.
 * This function rewrites `?` to `$N` when running on Postgres.
 */
function pgPlaceholders(sql: string): string {
  if (!dbKind) dbKind = detect(process.env.DATABASE_URL!);
  if (dbKind !== 'postgres') return sql;
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

function getPgPool(): PgPool {
  if (pgPool) return pgPool;
  const url = process.env.DATABASE_URL!;
  pgPool = new PgPool({
    connectionString: url,
    ssl: url.includes('sslmode=require') || url.includes('ssl=true')
      ? { rejectUnauthorized: false }
      : false,
    max: 5,
    idleTimeoutMillis: 30000,
  });
  return pgPool;
}

function getMysqlPool(): mariadb.Pool {
  if (mysqlPool) return mysqlPool;
  const url = process.env.DATABASE_URL!;
  const u = new URL(url);
  mysqlPool = mariadb.createPool({
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ''),
    connectionLimit: 5,
    dateStrings: true,
  });
  return mysqlPool;
}

async function query<T = unknown>(sql: string, args: unknown[] = []): Promise<T[]> {
  if (!dbKind) dbKind = detect(process.env.DATABASE_URL!);
  const finalSql = pgPlaceholders(sql);
  if (dbKind === 'postgres') {
    const r = await getPgPool().query(finalSql, args);
    return (r.rows as T[]);
  } else {
    const conn = await getMysqlPool().getConnection();
    try {
      return (await conn.query(sql, args)) as T[];
    } finally { conn.release(); }
  }
}

async function queryOne<T = unknown>(sql: string, args: unknown[] = []): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

async function exec(sql: string, args: unknown[] = []): Promise<void> {
  if (!dbKind) dbKind = detect(process.env.DATABASE_URL!);
  const finalSql = pgPlaceholders(sql);
  if (dbKind === 'postgres') {
    await getPgPool().query(finalSql, args);
  } else {
    const conn = await getMysqlPool().getConnection();
    try { await conn.query(sql, args); } finally { conn.release(); }
  }
}

// ---- Helpers ----

function cuid() { return randomUUID().replace(/-/g, '').slice(0, 25); }
function randomUUID() { return require('node:crypto').randomUUID(); }

function parseJSON<T>(s: unknown): T | null {
  if (s == null) return null;
  if (typeof s === 'object') return s as T;
  try { return JSON.parse(s as string) as T; } catch { return null; }
}
function parseJSONArray<T>(s: unknown): T[] {
  const v = parseJSON<T[]>(s);
  return v ?? [];
}
function toLower(s: string): 'admin'|'user'|'active'|'inactive'|string {
  return s.toLowerCase() as 'admin'|'user'|'active'|'inactive';
}

// ---- Row types ----

export interface UserRow {
  id: string; name: string; email: string; password: string;
  role: string; status: string;
  avatar: string | null; lastLogin: string | Date | null;
  createdAt: string | Date; updatedAt: string | Date;
}
export interface CategoryRow {
  id: string; name: string; slug: string; description: string | null;
  color: string; icon: string | null;
  createdAt: string | Date; updatedAt: string | Date;
}
export interface ProjectRow {
  id: string; title: string; slug: string; description: string;
  longDescription: string | null; thumbnail: string | null;
  gallery: unknown; categoryId: string | null;
  technologies: unknown; tags: unknown;
  color: string; status: string;
  featured: boolean | number; views: number;
  clientName: string | null; projectUrl: string | null;
  githubUrl: string | null; duration: string | null;
  teamSize: number | null;
  challenges: unknown; solutions: unknown; results: unknown;
  createdAt: string | Date; updatedAt: string | Date;
}
export interface OrderRow {
  id: string; orderNumber: string; projectType: string; plan: string;
  totalPrice: number; status: string;
  projectDetails: unknown; contactInfo: unknown;
  userId: string | null; notes: string | null;
  createdAt: string | Date; updatedAt: string | Date;
}
export interface SettingRow {
  id: string;
  siteName: string; siteDescription: string | null; siteUrl: string | null;
  contactEmail: string | null; primaryColor: string; secondaryColor: string;
  darkMode: string;
  emailNewOrder: string; emailOrderUpdates: string; emailNewUser: string;
  twoFactorAuth: string; sessionTimeout: number; maxLoginAttempts: number;
  passwordMinLength: number;
  apiRateLimit: number; apiEnabled: string; maintenanceMode: string;
  logRetention: number;
  createdAt: string | Date; updatedAt: string | Date;
}

function userMap(r: UserRow) {
  return {
    id: r.id, name: r.name, email: r.email, password: r.password,
    role: toLower(r.role), status: toLower(r.status),
    avatar: r.avatar, lastLogin: r.lastLogin ? new Date(r.lastLogin) : null,
    createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt),
  };
}
function categoryMap(r: CategoryRow) {
  return {
    id: r.id, name: r.name, slug: r.slug, description: r.description,
    color: r.color, icon: r.icon,
    createdAt: new Date(r.createdAt), updatedAt: new Date(r.updatedAt),
  };
}
function projectMap(r: ProjectRow & { category_id_j?: string | null; category_name?: string; category_slug?: string; category_color?: string; category_icon?: string | null }) {
  return {
    id: r.id, title: r.title, slug: r.slug, description: r.description,
    longDescription: r.longDescription, thumbnail: r.thumbnail,
    gallery: parseJSONArray<string>(r.gallery),
    categoryId: r.categoryId,
    technologies: parseJSONArray<string>(r.technologies),
    tags: parseJSONArray<string>(r.tags),
    color: r.color,
    status: toLower(r.status),
    featured: Boolean(r.featured),
    views: r.views,
    clientName: r.clientName, projectUrl: r.projectUrl, githubUrl: r.githubUrl,
    duration: r.duration, teamSize: r.teamSize,
    challenges: parseJSONArray<string>(r.challenges),
    solutions: parseJSONArray<string>(r.solutions),
    results: parseJSONArray<string>(r.results),
    category: r.category_id_j ? {
      id: r.category_id_j,
      name: r.category_name!,
      slug: r.category_slug!,
      color: r.category_color!,
      icon: r.category_icon ?? null,
    } : null,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}
function orderMap(r: OrderRow) {
  return {
    ...r,
    status: toLower(r.status),
    projectDetails: parseJSON<unknown>(r.projectDetails),
    contactInfo: parseJSON<unknown>(r.contactInfo),
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}
function settingMap(r: SettingRow) {
  return {
    ...r,
    createdAt: new Date(r.createdAt),
    updatedAt: new Date(r.updatedAt),
  };
}

// ---- Where-clause builders (parameterized, safe) ----

function buildWhere(where: Record<string, unknown> | undefined, tableAlias = ''): { sql: string; args: unknown[] } {
  if (!where) return { sql: '', args: [] };
  const prefix = tableAlias ? `${tableAlias}.` : '';
  const conds: string[] = [];
  const args: unknown[] = [];
  if (where.role) { conds.push(`${prefix}role = ?`); args.push(String(where.role).toUpperCase()); }
  if (where.status) {
    const status = where.status as string | { in?: string[]; not?: string };
    if (typeof status === 'string') {
      if (status === 'all') { /* no filter */ }
      else { conds.push(`${prefix}status = ?`); args.push(status.toUpperCase()); }
    } else if (typeof status === 'object' && 'in' in status && Array.isArray((status as { in: string[] }).in)) {
      const list = (status as { in: string[] }).in;
      conds.push(`${prefix}status IN (${list.map(() => '?').join(',')})`);
      args.push(...list.map((s) => s.toUpperCase()));
    }
  }
  if (where.featured !== undefined) { conds.push(`${prefix}featured = ?`); args.push(where.featured ? 1 : 0); }
  if (where.categoryId) { conds.push(`${prefix}categoryId = ?`); args.push(where.categoryId); }
  if (where.userId) { conds.push(`${prefix}"userId" = ?`); args.push(where.userId); }
  if (where.slug) { conds.push(`${prefix}slug = ?`); args.push(where.slug); }
  if (where.id) { conds.push(`${prefix}id = ?`); args.push(where.id); }
  if (where.email) { conds.push(`${prefix}email = ?`); args.push(where.email); }
  if (where.OR && Array.isArray(where.OR)) {
    const orParts: string[] = [];
    for (const orBlock of where.OR as Array<Record<string, unknown>>) {
      const sub: string[] = [];
      for (const [k, v] of Object.entries(orBlock)) {
        if (typeof v === 'object' && v && 'contains' in (v as Record<string, unknown>)) {
          sub.push(`${prefix}"${k}" LIKE ?`);
          args.push(`%${(v as Record<string, unknown>).contains}%`);
        } else {
          sub.push(`${prefix}"${k}" = ?`);
          args.push(v);
        }
      }
      orParts.push('(' + sub.join(' AND ') + ')');
    }
    conds.push('(' + orParts.join(' OR ') + ')');
  }
  return { sql: conds.join(' AND '), args };
}

function buildOrderBy(orderBy: unknown, tableAlias = ''): string {
  if (!orderBy) return '';
  const prefix = tableAlias ? `${tableAlias}.` : '';
  const entries = Array.isArray(orderBy) ? orderBy : [orderBy];
  const parts = entries.map((o) => {
    const [key, dir] = Object.entries(o as Record<string, string>)[0];
    return `${prefix}"${key}" ${dir === 'desc' ? 'DESC' : 'ASC'}`;
  });
  return ' ORDER BY ' + parts.join(', ');
}

// ---- API surface ----

export const prisma = {
  user: {
    async findUnique({ where, include }: { where: { id?: string; email?: string }; include?: { orders?: boolean } }) {
      const col = where.id ? 'id' : 'email';
      const row = await queryOne<UserRow>(`SELECT * FROM users WHERE "${col}" = ? LIMIT 1`, [where.id ?? where.email]);
      if (!row) return null;
      let u = userMap(row);
      if (include?.orders) {
        const ords = await query<OrderRow>(`SELECT * FROM orders WHERE "userId" = ? ORDER BY "createdAt" DESC`, [u.id]);
        (u as unknown as { orders: unknown[] }).orders = ords.map(orderMap);
      }
      return u;
    },
    async findMany({ where, orderBy, take, skip }: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, 'asc'|'desc'>;
      take?: number; skip?: number;
    } = {}) {
      const w = buildWhere(where);
      let sql = 'SELECT * FROM users';
      if (w.sql) sql += ' WHERE ' + w.sql;
      sql += buildOrderBy(orderBy);
      if (typeof take === 'number') sql += ` LIMIT ${take}`;
      if (typeof skip === 'number') sql += ` OFFSET ${skip}`;
      const rows = await query<UserRow>(sql, w.args);
      return rows.map(userMap);
    },
    async count({ where }: { where?: Record<string, unknown> } = {}) {
      const w = buildWhere(where);
      let sql = 'SELECT COUNT(*)::int AS c FROM users';
      if (w.sql) sql += ' WHERE ' + w.sql;
      const row = await queryOne<{ c: number }>(sql, w.args);
      return row?.c ?? 0;
    },
    async create({ data }: { data: Partial<UserRow> }) {
      const id = data.id ?? cuid();
      await exec(
        `INSERT INTO users (id, name, email, password, role, status, avatar, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, data.name, data.email, data.password, String(data.role ?? 'USER').toUpperCase(), String(data.status ?? 'ACTIVE').toUpperCase(), data.avatar ?? null],
      );
      return userMap((await queryOne<UserRow>(`SELECT * FROM users WHERE id = ?`, [id]))!);
    },
    async upsert({ where, update, create }: { where: { email?: string; id?: string }; update?: Record<string, unknown>; create: Partial<UserRow> }) {
      const col = where.email ? 'email' : 'id';
      const val = where.email ?? where.id;
      const existing = await queryOne<UserRow>(`SELECT * FROM users WHERE "${col}" = ? LIMIT 1`, [val]);
      if (existing) {
        if (update && Object.keys(update).length) {
          const sets: string[] = [];
          const args: unknown[] = [];
          for (const [k, v] of Object.entries(update)) {
            if (k === 'role' || k === 'status') { sets.push(`"${k}" = ?`); args.push(String(v).toUpperCase()); }
            else { sets.push(`"${k}" = ?`); args.push(v); }
          }
          sets.push(`"updatedAt" = NOW()`);
          args.push(val);
          await exec(`UPDATE users SET ${sets.join(', ')} WHERE "${col}" = ?`, args);
        }
        return userMap((await queryOne<UserRow>(`SELECT * FROM users WHERE "${col}" = ?`, [val]))!);
      }
      const id = create.id ?? cuid();
      await exec(
        `INSERT INTO users (id, name, email, password, role, status, avatar, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, create.name, create.email, create.password, String(create.role ?? 'USER').toUpperCase(), String(create.status ?? 'ACTIVE').toUpperCase(), create.avatar ?? null],
      );
      return userMap((await queryOne<UserRow>(`SELECT * FROM users WHERE id = ?`, [id]))!);
    },
    async update({ where, data }: { where: { id: string }; data: Record<string, unknown> }) {
      const sets: string[] = [];
      const args: unknown[] = [];
      for (const [k, v] of Object.entries(data)) {
        if (k === 'role' || k === 'status') { sets.push(`"${k}" = ?`); args.push(String(v).toUpperCase()); }
        else { sets.push(`"${k}" = ?`); args.push(v); }
      }
      sets.push(`"updatedAt" = NOW()`);
      args.push(where.id);
      await exec(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, args);
      return userMap((await queryOne<UserRow>(`SELECT * FROM users WHERE id = ?`, [where.id]))!);
    },
    async delete({ where }: { where: { id: string } }) {
      await exec(`DELETE FROM users WHERE id = ?`, [where.id]);
    },
  },

  category: {
    async findMany({ orderBy }: { orderBy?: Record<string, 'asc'|'desc'> } = {}) {
      let sql = 'SELECT * FROM categories';
      sql += buildOrderBy(orderBy);
      const rows = await query<CategoryRow>(sql);
      return rows.map(categoryMap);
    },
    async findUnique({ where }: { where: { id?: string; slug?: string } }) {
      const col = where.id ? 'id' : 'slug';
      const r = await queryOne<CategoryRow>(`SELECT * FROM categories WHERE "${col}" = ? LIMIT 1`, [where.id ?? where.slug]);
      return r ? categoryMap(r) : null;
    },
    async upsert({ where, update, create }: { where: { slug: string }; update: Partial<CategoryRow>; create: Omit<CategoryRow, 'id'|'createdAt'|'updatedAt'> }) {
      const existing = await queryOne<CategoryRow>(`SELECT * FROM categories WHERE slug = ? LIMIT 1`, [where.slug]);
      if (existing) {
        const sets: string[] = [];
        const args: unknown[] = [];
        for (const [k, v] of Object.entries(update)) { sets.push(`"${k}" = ?`); args.push(v); }
        sets.push(`"updatedAt" = NOW()`);
        args.push(where.slug);
        await exec(`UPDATE categories SET ${sets.join(', ')} WHERE slug = ?`, args);
        return categoryMap((await queryOne<CategoryRow>(`SELECT * FROM categories WHERE slug = ?`, [where.slug]))!);
      }
      const id = create.id ?? cuid();
      await exec(
        `INSERT INTO categories (id, name, slug, description, color, icon, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, create.name, create.slug, create.description ?? null, create.color ?? '#0ea5e9', create.icon ?? null],
      );
      return categoryMap((await queryOne<CategoryRow>(`SELECT * FROM categories WHERE id = ?`, [id]))!);
    },
    async create({ data }: { data: Omit<CategoryRow, 'createdAt'|'updatedAt'> }) {
      const id = data.id ?? cuid();
      await exec(
        `INSERT INTO categories (id, name, slug, description, color, icon, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [id, data.name, data.slug, data.description ?? null, data.color, data.icon ?? null],
      );
      return categoryMap((await queryOne<CategoryRow>(`SELECT * FROM categories WHERE id = ?`, [id]))!);
    },
    async update({ where, data }: { where: { id: string }; data: Partial<CategoryRow> }) {
      const sets: string[] = [];
      const args: unknown[] = [];
      for (const [k, v] of Object.entries(data)) { sets.push(`"${k}" = ?`); args.push(v); }
      sets.push(`"updatedAt" = NOW()`);
      args.push(where.id);
      await exec(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`, args);
      return categoryMap((await queryOne<CategoryRow>(`SELECT * FROM categories WHERE id = ?`, [where.id]))!);
    },
    async delete({ where }: { where: { id: string } }) {
      await exec(`DELETE FROM categories WHERE id = ?`, [where.id]);
    },
  },

  project: {
    async findMany({ where, orderBy, take, skip }: {
      where?: Record<string, unknown>;
      orderBy?: Array<Record<string, 'asc'|'desc'>> | Record<string, 'asc'|'desc'>;
      take?: number; skip?: number;
    } = {}) {
      const w = buildWhere(where, 'p');
      let sql = `SELECT p.*, c.id AS category_id_j, c.name AS category_name, c.slug AS category_slug, c.color AS category_color, c.icon AS category_icon
                 FROM projects p LEFT JOIN categories c ON p."categoryId" = c.id`;
      if (w.sql) sql += ' WHERE ' + w.sql;
      sql += buildOrderBy(orderBy, 'p');
      if (typeof take === 'number') sql += ` LIMIT ${take}`;
      if (typeof skip === 'number') sql += ` OFFSET ${skip}`;
      const rows = await query<ProjectRow & { category_id_j?: string|null; category_name?: string; category_slug?: string; category_color?: string; category_icon?: string|null }>(sql, w.args);
      return rows.map(projectMap);
    },
    async findUnique({ where }: { where: { id: string; slug?: string } }) {
      const col = where.id ? 'id' : 'slug';
      const rows = await query<ProjectRow & { category_id_j?: string|null; category_name?: string; category_slug?: string; category_color?: string; category_icon?: string|null }>(
        `SELECT p.*, c.id AS category_id_j, c.name AS category_name, c.slug AS category_slug, c.color AS category_color, c.icon AS category_icon
         FROM projects p LEFT JOIN categories c ON p."categoryId" = c.id
         WHERE p."${col}" = ? LIMIT 1`,
        [where.id ?? where.slug],
      );
      return rows[0] ? projectMap(rows[0]) : null;
    },
    async count({ where }: { where?: Record<string, unknown> } = {}) {
      const w = buildWhere(where);
      let sql = 'SELECT COUNT(*)::int AS c FROM projects';
      if (w.sql) sql += ' WHERE ' + w.sql;
      const r = await queryOne<{ c: number }>(sql, w.args);
      return r?.c ?? 0;
    },
    async upsert({ where, update, create }: { where: { slug: string }; update: Partial<ProjectRow>; create: Partial<ProjectRow> }) {
      const existing = await queryOne<{ id: string }>(`SELECT id FROM projects WHERE slug = ? LIMIT 1`, [where.slug]);
      if (existing) {
        const sets: string[] = [];
        const args: unknown[] = [];
        const jsonCols = new Set(['technologies','tags','challenges','solutions','results','gallery']);
        for (const [k, v] of Object.entries(update)) {
          if (k === 'id' || k === 'createdAt' || k === 'updatedAt') continue;
          if (k === 'status') { sets.push(`"${k}" = ?`); args.push(String(v).toUpperCase()); }
          else if (k === 'featured') { sets.push(`"${k}" = ?`); args.push(v ? 1 : 0); }
          else if (jsonCols.has(k)) { sets.push(`"${k}" = ?::jsonb`); args.push(JSON.stringify(v ?? [])); }
          else { sets.push(`"${k}" = ?`); args.push(v); }
        }
        sets.push(`"updatedAt" = NOW()`);
        args.push(existing.id);
        await exec(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`, args);
        return (await queryOne<ProjectRow>(`SELECT * FROM projects WHERE id = ?`, [existing.id]))!;
      }
      const id = cuid();
      const data = { ...create, slug: where.slug };
      await exec(
        `INSERT INTO projects (id, title, slug, description, "longDescription", thumbnail, "categoryId", technologies, tags, color, status, featured, "clientName", "projectUrl", "githubUrl", duration, "teamSize", challenges, solutions, results, gallery, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, ?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?::jsonb, ?::jsonb, NOW(), NOW())`,
        [
              id, data.title, data.slug, data.description,
              data.longDescription ?? null, data.thumbnail ?? null, data.categoryId ?? null,
              JSON.stringify(data.technologies ?? []), JSON.stringify(data.tags ?? []),
              data.color ?? '#0ea5e9',
              String(data.status ?? 'DRAFT').toUpperCase(),
              data.featured ? 1 : 0,
              data.clientName ?? null, data.projectUrl ?? null, data.githubUrl ?? null,
              data.duration ?? null, data.teamSize ?? null,
              JSON.stringify(data.challenges ?? []), JSON.stringify(data.solutions ?? []),
              JSON.stringify(data.results ?? []), JSON.stringify(data.gallery ?? []),
            ],
      );
      return (await queryOne<ProjectRow>(`SELECT * FROM projects WHERE id = ?`, [id]))!;
    },
    async update({ where, data }: { where: { id: string }; data: Partial<ProjectRow> }) {
      const sets: string[] = [];
      const args: unknown[] = [];
      const jsonCols = new Set(['technologies','tags','challenges','solutions','results','gallery']);
      for (const [k, v] of Object.entries(data)) {
        if (k === 'id' || k === 'createdAt' || k === 'updatedAt') continue;
        if (k === 'status') { sets.push(`"${k}" = ?`); args.push(String(v).toUpperCase()); }
        else if (k === 'featured') { sets.push(`"${k}" = ?`); args.push(v ? 1 : 0); }
        else if (jsonCols.has(k)) { sets.push(`"${k}" = ?::jsonb`); args.push(JSON.stringify(v ?? [])); }
        else { sets.push(`"${k}" = ?`); args.push(v); }
      }
      sets.push(`"updatedAt" = NOW()`);
      args.push(where.id);
      await exec(`UPDATE projects SET ${sets.join(', ')} WHERE id = ?`, args);
      return (await queryOne<ProjectRow>(`SELECT * FROM projects WHERE id = ?`, [where.id]))!;
    },
    async delete({ where }: { where: { id: string } }) {
      await exec(`DELETE FROM projects WHERE id = ?`, [where.id]);
    },
  },

  order: {
    async findMany({ where, orderBy, take, skip }: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, 'asc'|'desc'>;
      take?: number; skip?: number;
    } = {}) {
      const w = buildWhere(where);
      let sql = 'SELECT * FROM orders';
      if (w.sql) sql += ' WHERE ' + w.sql;
      sql += buildOrderBy(orderBy);
      if (typeof take === 'number') sql += ` LIMIT ${take}`;
      if (typeof skip === 'number') sql += ` OFFSET ${skip}`;
      const rows = await query<OrderRow>(sql, w.args);
      return rows.map(orderMap);
    },
    async findUnique({ where }: { where: { id: string } }) {
      const r = await queryOne<OrderRow>(`SELECT * FROM orders WHERE id = ? LIMIT 1`, [where.id]);
      return r ? orderMap(r) : null;
    },
    async count({ where }: { where?: Record<string, unknown> } = {}) {
      const w = buildWhere(where);
      let sql = 'SELECT COUNT(*)::int AS c FROM orders';
      if (w.sql) sql += ' WHERE ' + w.sql;
      const r = await queryOne<{ c: number }>(sql, w.args);
      return r?.c ?? 0;
    },
    async create({ data }: { data: Partial<OrderRow> }) {
      const id = data.id ?? cuid();
      await exec(
        `INSERT INTO orders (id, "orderNumber", "projectType", plan, "totalPrice", status, "projectDetails", "contactInfo", "userId", notes, "createdAt", "updatedAt")
         VALUES (?, ?, ?, ?, ?, ?, ?::jsonb, ?::jsonb, ?, ?, NOW(), NOW())`,
        [
              id, data.orderNumber, data.projectType, data.plan, data.totalPrice,
              String(data.status ?? 'PENDING').toUpperCase(),
              JSON.stringify(data.projectDetails ?? null), JSON.stringify(data.contactInfo ?? {}),
              data.userId ?? null, data.notes ?? null,
            ],
      );
      return orderMap((await queryOne<OrderRow>(`SELECT * FROM orders WHERE id = ?`, [id]))!);
    },
    async update({ where, data }: { where: { id: string }; data: Partial<OrderRow> }) {
      const sets: string[] = [];
      const args: unknown[] = [];
      for (const [k, v] of Object.entries(data)) {
        if (k === 'id' || k === 'createdAt' || k === 'updatedAt') continue;
        if (k === 'status') { sets.push(`"${k}" = ?`); args.push(String(v).toUpperCase()); }
        else if (k === 'projectDetails' || k === 'contactInfo') { sets.push(`"${k}" = ?::jsonb`); args.push(JSON.stringify(v)); }
        else { sets.push(`"${k}" = ?`); args.push(v); }
      }
      sets.push(`"updatedAt" = NOW()`);
      args.push(where.id);
      await exec(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`, args);
      return orderMap((await queryOne<OrderRow>(`SELECT * FROM orders WHERE id = ?`, [where.id]))!);
    },
    async delete({ where }: { where: { id: string } }) {
      await exec(`DELETE FROM orders WHERE id = ?`, [where.id]);
    },
  },

  setting: {
    async upsert({ where, update = {}, create = {} }: { where: { id: string }; update?: Partial<SettingRow>; create?: Partial<SettingRow> }) {
      const existing = await queryOne<{ id: string }>(`SELECT id FROM settings WHERE id = ? LIMIT 1`, [where.id]);
      if (!existing) {
        await exec(`INSERT INTO settings (id) VALUES (?)`, [where.id]);
      }
      if (Object.keys(update).length) {
        const sets: string[] = [];
        const args: unknown[] = [];
        for (const [k, v] of Object.entries(update)) {
          if (k === 'id') continue;
          sets.push(`"${k}" = ?`);
          args.push(v);
        }
        sets.push(`"updatedAt" = NOW()`);
        args.push(where.id);
        await exec(`UPDATE settings SET ${sets.join(', ')} WHERE id = ?`, args);
      }
      return settingMap((await queryOne<SettingRow>(`SELECT * FROM settings WHERE id = ?`, [where.id]))!);
    },
  },
};

export default prisma;