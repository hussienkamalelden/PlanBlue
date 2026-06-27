# PlanBlue — E-commerce Toy Store (Monorepo)

Single-repository monorepo for the PlanBlue online toy store.

| Layer           | Stack                                     |
| --------------- | ----------------------------------------- |
| Storefront      | Next.js 15 (App Router) + Tailwind CSS    |
| Backend & Admin | Strapi 5 (Community Edition)              |
| Database        | PostgreSQL 16                             |
| Media           | Cloudflare R2 (S3-compatible, via Strapi) |
| Email           | Resend + React Email                      |
| Deploy          | Hetzner VPS + Coolify (self-hosted)       |

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

1. **Node.js 20+**
2. **pnpm 9+** — `npm install -g pnpm`
3. **PostgreSQL 16** — Docker Desktop + Docker Compose
4. **Git**

---

## Step 1 — Clone & install dependencies

```powershell
\PlanBlue
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

## Step 3 — First Strapi run

```powershell
pnpm --filter @planblue/cms install
pnpm dev:cms
```

Open [http://localhost:1337/admin](http://localhost:1337/admin) and create your admin account.

---

## Step 4 — Run development servers

```powershell
pnpm dev:web   # http://localhost:3000
pnpm dev:cms   # http://localhost:1337/admin
pnpm dev       # both in parallel
```
