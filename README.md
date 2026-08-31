# Org Portfolio — Next.js 14 + Prisma + MySQL

A 3D portfolio platform with admin CMS and an order-management workflow.

Originally a MERN-stack app (React + Express + LowDB/JSON), now rebuilt as a single Next.js 14 App Router application backed by Prisma + MySQL, designed to be deployed on a Hostinger KVM VPS with PM2, Nginx, Let's Encrypt SSL, and daily database backups.

---

## Features

### Public site
- **Immersive 3D hero scene** — interactive particle field, floating gradient shapes, parallax camera (Three.js + React Three Fiber)
- **Portfolio gallery** — filterable by category, searchable, grid/list view, project cards with mini 3D scenes
- **Project detail pages** — long-form project view with its own dedicated 3D scene, gallery, technologies, challenges/solutions/results
- **5-step Order flow** — project type → details → pricing tier → contact → review, with 6 project types × 3 plans
- **About / Contact pages**, dark mode, responsive layout

### Authentication
- **JWT cookies** (httpOnly, SameSite=Lax, secure in production) — backed by `jose` (no edge-runtime issues)
- **bcrypt** password hashing (cost 10)
- `/login`, `/register`, `/me`, `/profile`, `/password`, `/logout` endpoints
- Default admin seeded on first run

### Admin CMS (`/admin/*`)
- **Dashboard** — project/order/user/revenue stats + recent orders
- **Projects** — full CRUD with status, featured toggle, category, tags, technologies, gallery, color
- **Orders** — list, search, status flow (`pending → confirmed → in_progress → review → completed`), detail modal, delete
- **Users** — list, role toggle, active/inactive toggle, delete (with self-protection)
- **Settings** — site info, theme colors, security policies, notification toggles, maintenance mode, log retention

---

## Tech Stack

| Layer | Tech |
|------|------|
| Framework | Next.js 14.2.5 (App Router, React 18) |
| Language | TypeScript 5.6 |
| Database | MySQL 8 / MariaDB 10.6+ |
| ORM | Prisma 5.22 |
| Auth | JWT (`jose`) + bcryptjs + httpOnly cookies |
| 3D | Three.js 0.158 + React Three Fiber 8 + Drei |
| Animation | Framer Motion 10 |
| Styling | Tailwind CSS 3.4 |
| Validation | Zod 3 |
| Process mgr | PM2 (cluster mode) |

---

## Local Development

### 1. Prerequisites
- Node.js 20+
- MySQL 8 / MariaDB 10.6+
- npm 10+

### 2. Database

```bash
# Option A: Local MySQL
mysql -u root -p
CREATE DATABASE org_portfolio;
CREATE USER 'portfolio'@'localhost' IDENTIFIED BY 'portfolio';
GRANT ALL ON org_portfolio.* TO 'portfolio'@'localhost';
FLUSH PRIVILEGES;

# Option B: Docker
docker run -d --name mysql-portfolio \
  -e MYSQL_ROOT_PASSWORD=rootpass \
  -e MYSQL_DATABASE=org_portfolio \
  -e MYSQL_USER=portfolio \
  -e MYSQL_PASSWORD=portfolio \
  -p 3306:3306 \
  mysql:8
```

### 3. App setup

```bash
cp .env.example .env
# Edit .env: set DATABASE_URL and JWT_SECRET

npm install
npm run db:push       # apply schema
npm run db:seed       # seed admin + categories + sample projects
npm run dev           # http://localhost:3000
```

Default credentials after seed:
- **Admin**: `admin@orgportfolio.com` / `admin123`
- **App URL**: http://localhost:3000
- **Admin URL**: http://localhost:3000/admin/dashboard

---

## Production Build

```bash
npm run build
npm run start   # listens on PORT (default 3000)
```

The Prisma client is regenerated automatically during `npm install` (postinstall hook) and `npm run build`.

---

## Hostinger KVM VPS Deployment

See **[`deploy/HOSTINGER.md`](./deploy/HOSTINGER.md)** for the complete step-by-step guide covering:
- Server prep (non-root sudo user, firewall, Fail2Ban)
- Node.js 20 + PM2 + Nginx + Certbot
- MySQL 8 secure install
- App deployment via git or rsync
- HTTPS via Let's Encrypt (auto-renew)
- systemd auto-start on reboot
- Daily MySQL backups (cron + 14-day retention)
- Log rotation
- Health checks
- Rollback procedure

### TL;DR (after initial server setup)

```bash
# On the server, as the app user:
cd /home/portfolio
git clone <repo> app   # or rsync from local
cd app
cp .env.example .env && nano .env       # set DATABASE_URL, JWT_SECRET, etc.
npm ci
npm run db:push
npm run db:seed

# Start with PM2
pm2 start npm --name org-portfolio -- start
pm2 save
pm2 startup   # follow the printed command as root
```

Nginx + SSL templates are in `deploy/nginx/`.

---

## Project Structure

```
org-portfolio/
├── app/
│   ├── (public)/              # Public-facing pages, share Header/Footer
│   │   ├── page.tsx           # Home (3D hero)
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── portfolio/
│   │   │   ├── page.tsx
│   │   │   ├── PortfolioBrowser.tsx
│   │   │   └── [id]/page.tsx  # Project detail
│   │   └── order/
│   │       ├── page.tsx
│   │       └── OrderWizard.tsx
│   ├── admin/                 # Admin CMS (auth-gated layout)
│   │   ├── layout.tsx         # redirect non-admin to /login
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── orders/
│   │   ├── users/
│   │   └── settings/
│   ├── api/                   # Route handlers
│   │   ├── auth/              # login, register, me, profile, password, logout
│   │   ├── portfolio/         # public listing, [id], categories
│   │   ├── orders/            # public POST, [id] admin
│   │   ├── admin/             # stats, users, settings
│   │   └── health/
│   ├── globals.css
│   ├── layout.tsx             # root html, metadata, providers, Toaster
│   ├── not-found.tsx
│   └── page.tsx               # ← lives in (public)/
├── components/
│   ├── admin/AdminShell.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── providers/
│   │   ├── Providers.tsx      # theme + AuthProvider
│   │   └── AuthProvider.tsx
│   └── three/
│       ├── HomeScene.tsx
│       ├── HomeSceneContent.tsx
│       ├── Scene3D.tsx        # shapes, particles, grid, lights
│       ├── ProjectCard3D.tsx
│       └── ProjectDetailScene.tsx
├── lib/
│   ├── prisma.ts              # PrismaClient singleton
│   ├── auth.ts                # JWT, bcrypt, cookies
│   ├── api.ts                 # ok/badRequest/handleApiError helpers
│   ├── pricing.ts             # PROJECT_TYPES + PRICING_PLANS
│   └── index.ts
├── prisma/
│   ├── schema.prisma          # User, Category, Project, Order, Setting
│   └── seed.ts                # admin + 4 categories + 3 sample projects
├── deploy/
│   ├── HOSTINGER.md           # full deployment guide
│   ├── nginx/
│   │   └── portfolio.conf     # Nginx site config
│   ├── systemd/
│   │   └── portfolio.service  # (optional) systemd unit
│   ├── scripts/
│   │   ├── backup.sh          # daily mysqldump
│   │   ├── deploy.sh          # git pull + npm ci + build + pm2 reload
│   │   ├── verify.sh          # health check + smoke tests
│   │   └── rollback.sh
│   └── env/
│       └── .env.production.example
├── public/                    # static assets
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Environment Variables

| Var | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | ✅ | 48+ char random. Generate: `openssl rand -base64 48` |
| `JWT_EXPIRES_IN` | optional | Token TTL (default `7d`) |
| `NODE_ENV` | ✅ | `production` for prod |
| `NEXT_PUBLIC_SITE_URL` | recommended | Used in metadata, e.g. `https://yourdomain.com` |
| `NEXT_PUBLIC_SITE_NAME` | optional | Override site name |
| `ADMIN_EMAIL` | optional (seed) | Defaults to `admin@orgportfolio.com` |
| `ADMIN_PASSWORD` | optional (seed) | Defaults to `admin123` — **change immediately!** |
| `ADMIN_NAME` | optional (seed) | Defaults to `Admin User` |

---

## API Reference (summary)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | none | DB + counts ping |
| POST | `/api/auth/register` | none | New user (sets cookie) |
| POST | `/api/auth/login` | none | Login (sets cookie) |
| GET | `/api/auth/me` | user | Current user |
| PUT | `/api/auth/profile` | user | Update name/email |
| PUT | `/api/auth/password` | user | Change password |
| POST | `/api/auth/logout` | none | Clear cookie |
| GET | `/api/portfolio` | none | List projects + categories (paginated) |
| GET | `/api/portfolio/:id` | none | Single project (+1 view) |
| POST | `/api/portfolio` | admin | Create project |
| PUT | `/api/portfolio/:id` | admin | Update project |
| DELETE | `/api/portfolio/:id` | admin | Delete project |
| GET/POST | `/api/portfolio/categories` | mixed | List/create |
| PUT/DELETE | `/api/portfolio/categories/:id` | admin | Update/delete |
| POST | `/api/orders` | optional | Create order (public) |
| GET | `/api/orders` | user (own) / admin (all) | List orders |
| GET | `/api/orders/:id` | owner/admin | Get one |
| PATCH | `/api/orders/:id` | admin | Update status |
| DELETE | `/api/orders/:id` | admin | Delete |
| GET | `/api/admin/stats` | admin | Dashboard stats |
| GET | `/api/admin/users` | admin | List users |
| GET/PUT/DELETE | `/api/admin/users/:id` | admin | User details |
| GET/PUT | `/api/admin/settings` | admin | App settings |

---

## License

MIT