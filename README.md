# PlanBlue — E-commerce Toy Store (Monorepo)

Single-repository monorepo for the PlanBlue online toy store.

| Layer | Stack |
|-------|-------|
| Storefront | Next.js 15 (App Router) + Tailwind CSS |
| Backend & Admin | Strapi 5 (Community Edition) |
| Database | PostgreSQL 16 |
| Media | Cloudflare R2 (S3-compatible, via Strapi) |
| Email | Resend + React Email |
| Deploy | Hetzner VPS + Coolify (self-hosted) |

## Repository layout

```
PlanBlue/
├── apps/
│   ├── web/          # Next.js storefront
│   └── cms/          # Strapi backend + admin dashboard
├── packages/
│   ├── shared/       # Shared TypeScript types & constants
│   └── email/        # React Email templates (Resend)
├── config/env/       # Environment variable templates (no secrets)
├── docker/           # Local PostgreSQL via Docker Compose
├── docs/             # Architecture & schema blueprints
└── .github/workflows # CI placeholders
```

## Prerequisites

Install before starting:

1. **Node.js 20+** — [nodejs.org](https://nodejs.org/)
2. **pnpm 9+** — `npm install -g pnpm`
3. **PostgreSQL 16** — choose one:
   - **Option A (recommended):** Docker Desktop + Docker Compose
   - **Option B:** Native PostgreSQL on Windows
4. **Git**

Optional (later): Cloudflare R2 bucket, Resend API key, Coolify on Hetzner.

---

## Step 1 — Clone & install dependencies

```powershell
cd c:\Users\hussi\Desktop\PlanBlue
pnpm install
```

---

## Step 2 — Local PostgreSQL

### Option A: Docker Compose

```powershell
Copy-Item docker\.env.example docker\.env
pnpm db:up
pnpm db:logs
```

Default credentials:

| Variable | Value |
|----------|-------|
| Host | `127.0.0.1` |
| Port | `5432` |
| Database | `planblue` |
| User | `planblue` |
| Password | `planblue_dev` |

### Option B: Native PostgreSQL (Windows)

```sql
CREATE USER planblue WITH PASSWORD 'planblue_dev';
CREATE DATABASE planblue OWNER planblue;
GRANT ALL PRIVILEGES ON DATABASE planblue TO planblue;
```

---

## Step 3 — Environment files

```powershell
Copy-Item config\env\cms.env.example apps\cms\.env
Copy-Item config\env\web.env.example apps\web\.env.local
```

Generate Strapi secrets:

```powershell
node -e "for (let i = 0; i < 4; i++) console.log(require('crypto').randomBytes(16).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

---

## Step 4 — First Strapi run

```powershell
pnpm --filter @planblue/cms install
pnpm dev:cms
```

Open [http://localhost:1337/admin](http://localhost:1337/admin) and create your admin account.

---

## Step 5 — Run development servers

```powershell
pnpm dev:web   # http://localhost:3000
pnpm dev:cms   # http://localhost:1337/admin
pnpm dev       # both in parallel
```

---

## What comes next

1. Strapi content-types: Product, Category, Order, Marketer, Promocode
2. Cloudflare R2 upload provider
3. Next.js product listing & LocalStorage cart
4. Guest checkout API
5. Resend + React Email
6. Real-time analytics & daily cron reports
7. Coolify deployment

See [docs/architecture.md](docs/architecture.md) and [docs/content-types.md](docs/content-types.md).
