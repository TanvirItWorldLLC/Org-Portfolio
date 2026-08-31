-- Org Portfolio schema (Prisma-equivalent)
-- Run via: mysql ... < schema.sql

CREATE TABLE IF NOT EXISTS users (
  id          VARCHAR(30) NOT NULL,
  name        VARCHAR(191) NOT NULL,
  email       VARCHAR(191) NOT NULL,
  password    VARCHAR(191) NOT NULL,
  role        ENUM('ADMIN','USER') NOT NULL DEFAULT 'USER',
  status      ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  avatar      VARCHAR(191) NULL,
  lastLogin   DATETIME(3) NULL,
  createdAt   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY users_email_key (email),
  KEY users_role_idx (role),
  KEY users_status_idx (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
  id          VARCHAR(30) NOT NULL,
  name        VARCHAR(191) NOT NULL,
  slug        VARCHAR(191) NOT NULL,
  description TEXT NULL,
  color        VARCHAR(191) NOT NULL DEFAULT '#0ea5e9',
  icon        VARCHAR(191) NULL,
  createdAt   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY categories_slug_key (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS projects (
  id              VARCHAR(30) NOT NULL,
  title           VARCHAR(191) NOT NULL,
  slug            VARCHAR(191) NOT NULL,
  description     TEXT NOT NULL,
  longDescription TEXT NULL,
  thumbnail       TEXT NULL,
  gallery         JSON NULL,
  categoryId      VARCHAR(30) NULL,
  technologies    JSON NULL,
  tags            JSON NULL,
  color           VARCHAR(191) NOT NULL DEFAULT '#0ea5e9',
  status          ENUM('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
  featured        TINYINT(1) NOT NULL DEFAULT 0,
  views           INT NOT NULL DEFAULT 0,
  clientName      VARCHAR(191) NULL,
  projectUrl      VARCHAR(191) NULL,
  githubUrl       VARCHAR(191) NULL,
  duration        VARCHAR(191) NULL,
  teamSize        INT NULL,
  challenges      JSON NULL,
  solutions       JSON NULL,
  results         JSON NULL,
  createdAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY projects_slug_key (slug),
  KEY projects_status_idx (status),
  KEY projects_categoryId_idx (categoryId),
  KEY projects_featured_idx (featured),
  CONSTRAINT projects_categoryId_fkey FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id              VARCHAR(30) NOT NULL,
  orderNumber     VARCHAR(191) NOT NULL,
  projectType     VARCHAR(191) NOT NULL,
  plan            VARCHAR(191) NOT NULL,
  totalPrice      INT NOT NULL,
  status          ENUM('PENDING','CONFIRMED','IN_PROGRESS','REVIEW','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  projectDetails  JSON NULL,
  contactInfo     JSON NOT NULL,
  userId          VARCHAR(30) NULL,
  notes           TEXT NULL,
  createdAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt       DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY orders_orderNumber_key (orderNumber),
  KEY orders_status_idx (status),
  KEY orders_userId_idx (userId),
  CONSTRAINT orders_userId_fkey FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS settings (
  id                  VARCHAR(20) NOT NULL DEFAULT 'default',
  siteName            VARCHAR(191) NOT NULL DEFAULT 'Org Portfolio',
  siteDescription     TEXT NULL,
  siteUrl             VARCHAR(191) NULL,
  contactEmail        VARCHAR(191) NULL,
  primaryColor        VARCHAR(191) NOT NULL DEFAULT '#0ea5e9',
  secondaryColor      VARCHAR(191) NOT NULL DEFAULT '#8b5cf6',
  darkMode            VARCHAR(191) NOT NULL DEFAULT 'system',
  emailNewOrder       VARCHAR(191) NOT NULL DEFAULT 'true',
  emailOrderUpdates   VARCHAR(191) NOT NULL DEFAULT 'true',
  emailNewUser        VARCHAR(191) NOT NULL DEFAULT 'true',
  twoFactorAuth       VARCHAR(191) NOT NULL DEFAULT 'false',
  sessionTimeout      INT NOT NULL DEFAULT 30,
  maxLoginAttempts    INT NOT NULL DEFAULT 5,
  passwordMinLength   INT NOT NULL DEFAULT 8,
  apiRateLimit        INT NOT NULL DEFAULT 1000,
  apiEnabled          VARCHAR(191) NOT NULL DEFAULT 'true',
  maintenanceMode     VARCHAR(191) NOT NULL DEFAULT 'false',
  logRetention        INT NOT NULL DEFAULT 90,
  createdAt           DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt           DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;