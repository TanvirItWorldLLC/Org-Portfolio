-- Org Portfolio schema (Prisma Postgres — direct DDL)
-- Apply via:  PGPASSWORD=... psql -h pooled.db.prisma.io -U ... -d postgres -f schema.pg.sql
--
-- Note: Postgres enums are case-sensitive and UPPERCASE. We declare them
-- as TEXT with CHECK constraints so Prisma's lowercase literals serialize cleanly.

-- Drop in dependency order
DROP TABLE IF EXISTS "orders" CASCADE;
DROP TABLE IF EXISTS "projects" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "settings" CASCADE;

CREATE TABLE "users" (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'USER' CHECK (role IN ('ADMIN','USER')),
  status      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  avatar      TEXT,
  "lastLogin" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX users_role_idx ON "users"(role);
CREATE INDEX users_status_idx ON "users"(status);

CREATE TABLE "categories" (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  color       TEXT NOT NULL DEFAULT '#0ea5e9',
  icon        TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX categories_slug_idx ON "categories"(slug);

CREATE TABLE "projects" (
  id               TEXT PRIMARY KEY,
  title            TEXT NOT NULL,
  slug             TEXT NOT NULL UNIQUE,
  description      TEXT NOT NULL,
  "longDescription" TEXT,
  thumbnail        TEXT,
  gallery          JSONB,
  "categoryId"     TEXT,
  technologies     JSONB,
  tags             JSONB,
  color            TEXT NOT NULL DEFAULT '#0ea5e9',
  status           TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','PUBLISHED','ARCHIVED')),
  featured         BOOLEAN NOT NULL DEFAULT FALSE,
  views            INTEGER NOT NULL DEFAULT 0,
  "clientName"     TEXT,
  "projectUrl"     TEXT,
  "githubUrl"      TEXT,
  duration         TEXT,
  "teamSize"       INTEGER,
  challenges       JSONB,
  solutions        JSONB,
  results          JSONB,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX projects_slug_idx ON "projects"(slug);
CREATE INDEX projects_status_idx ON "projects"(status);
CREATE INDEX projects_category_idx ON "projects"("categoryId");
CREATE INDEX projects_featured_idx ON "projects"(featured);

CREATE TABLE "orders" (
  id               TEXT PRIMARY KEY,
  "orderNumber"    TEXT NOT NULL UNIQUE,
  "projectType"    TEXT NOT NULL,
  plan             TEXT NOT NULL,
  "totalPrice"     INTEGER NOT NULL,
  status           TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','IN_PROGRESS','REVIEW','COMPLETED','CANCELLED')),
  "projectDetails" JSONB,
  "contactInfo"    JSONB NOT NULL,
  "userId"         TEXT,
  notes            TEXT,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX orders_status_idx ON "orders"(status);
CREATE INDEX orders_user_idx ON "orders"("userId");
CREATE INDEX orders_number_idx ON "orders"("orderNumber");

CREATE TABLE "settings" (
  id                  TEXT PRIMARY KEY DEFAULT 'default',
  "siteName"          TEXT NOT NULL DEFAULT 'Org Portfolio',
  "siteDescription"   TEXT,
  "siteUrl"           TEXT,
  "contactEmail"      TEXT,
  "primaryColor"      TEXT NOT NULL DEFAULT '#0ea5e9',
  "secondaryColor"    TEXT NOT NULL DEFAULT '#8b5cf6',
  "darkMode"          TEXT NOT NULL DEFAULT 'system',
  "emailNewOrder"     TEXT NOT NULL DEFAULT 'true',
  "emailOrderUpdates" TEXT NOT NULL DEFAULT 'true',
  "emailNewUser"      TEXT NOT NULL DEFAULT 'true',
  "twoFactorAuth"     TEXT NOT NULL DEFAULT 'false',
  "sessionTimeout"    INTEGER NOT NULL DEFAULT 30,
  "maxLoginAttempts"  INTEGER NOT NULL DEFAULT 5,
  "passwordMinLength" INTEGER NOT NULL DEFAULT 8,
  "apiRateLimit"      INTEGER NOT NULL DEFAULT 1000,
  "apiEnabled"        TEXT NOT NULL DEFAULT 'true',
  "maintenanceMode"   TEXT NOT NULL DEFAULT 'false',
  "logRetention"      INTEGER NOT NULL DEFAULT 90,
  "createdAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);