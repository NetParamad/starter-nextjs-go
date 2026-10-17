[English](README.md) | [ไทย](README.th.md)

# Template Next.js Go

[![license](https://img.shields.io/github/license/netparamad/template-nextjs-go)](./LICENSE)

A full-stack starter monorepo built with Next.js, Go, and PostgreSQL — a modern frontend app plus a layered Go API, authentication flows, a protected dashboard, local Dockerized development, and CI-ready quality checks.

## Overview

This template gives you the developer experience of a polished frontend starter together with a production-minded Go backend, a shared monorepo workflow, and safer default auth behavior out of the box.

Start a new project from this template:

```bash
git clone https://github.com/netparamad/template-nextjs-go my-app
cd my-app
npm run dev
```

Then follow the [rename guide](./docs/rename.md) to rebrand it.

The frontend and backend evolve together, share the same local setup flow, and are coordinated through root-level commands, so a monorepo is a natural fit here (best for small to medium teams with tightly integrated projects).

## Features

- reusable Next.js + Go monorepo structure
- auth flows: register, login, email verification, password reset, refresh, logout
- stateful refresh-token rotation (single-use tokens in `user_sessions`) with silent frontend renew
- owner-only protected dashboard and analytics-ready frontend patterns
- Dockerized local PostgreSQL setup via Docker Compose
- typed API client generated from the OpenAPI contract
- in-memory frontend auth tokens (not persisted across browser refreshes)
- demo account seeding for local development
- lint, format check, unit tests, Playwright smoke tests, production build, Go test, and Go build checks
- focused GitHub Actions validation, CodeQL scanning, `gitleaks` secret scanning, and Dependabot

## Architecture

The repository is a monorepo with two applications that share a root-level toolchain:

- **frontend/**: a Next.js (App Router) app with a feature-based `src` layout, auth, dashboard, and shared UI primitives.
- **backend/**: a layered Go API (`handler` → `service` → `repository`) with PostgreSQL and SQL migrations.
- **PostgreSQL**: run locally through Docker Compose; the API runs pending migrations automatically on boot.
- **Contract-first API**: `docs/openapi.yaml` is the source of truth; `frontend/src/generated/openapi.ts` is generated from it.

Request flow:

```text
Browser (Next.js)
  └─ fetch → Go API (/api/v1/*) → service → repository (pgx) → PostgreSQL
```

The backend wraps its router with CORS, security headers, request IDs, and request logging. Public auth endpoints are rate-limited (20 requests/minute per IP, in-memory). The analytics endpoint is gated by auth + owner-only middleware.

## Tech Stack

**Frontend**

- Next.js 16
- React 19
- TypeScript 5.9
- Tailwind CSS 4
- shadcn/ui
- TanStack Query
- Zustand
- Lucide React
- next-themes

**Backend**

- Go 1.25
- PostgreSQL (pgx v5)
- `golang-jwt/jwt/v5`
- `golang.org/x/crypto` (password hashing)
- `joho/godotenv`
- SQL migrations

**Tooling / infra**

- Docker Compose
- GitHub Actions (CI, CodeQL)
- ESLint, Prettier, Vitest, Playwright (frontend)
- golangci-lint v2 (backend)
- Dependabot, `gitleaks`, `actionlint`

## Project Structure

```text
.
├── backend/            # Go API
│   ├── cmd/api/        # entrypoint (main.go)
│   ├── internal/
│   │   ├── config/     # config loading + production validation
│   │   ├── domain/     # domain models
│   │   ├── handler/http/  # HTTP handlers
│   │   ├── repository/    # DB access + embedded migrations
│   │   ├── server/        # router + rate limiting
│   │   └── service/       # business logic
│   ├── migrations/        # applyable SQL migrations (up/down pairs)
│   └── Makefile           # run, build, fmt, tidy, lint
├── frontend/           # Next.js app
│   ├── src/
│   │   ├── app/        # App Router routes ((auth), (site), (workspace))
│   │   ├── components/ # shared UI (shadcn/ui primitives, header, footer)
│   │   ├── features/   # auth/, dashboard/, home/, shared/
│   │   ├── generated/  # OpenAPI-generated types
│   │   ├── layouts/    # root + route-area shells
│   │   ├── lib/        # api client, app config, site copy
│   │   └── types/      # shared TypeScript types
│   ├── e2e/            # Playwright smoke + mobile specs
│   └── Dockerfile
├── docs/               # openapi.yaml + project docs
├── scripts/            # root dev/verification scripts
├── compose.yml         # postgres + optional prod profile
├── package.json        # root scripts + OpenAPI tooling
└── .github/            # CI workflows + Dependabot
```

## Getting Started

### Prerequisites

- Node.js `>=22` (see `.nvmrc`)
- Go 1.25+
- Docker (for local PostgreSQL and the prod-like profile)

### Quick start (Docker Compose + root scripts)

1. Run `npm run dev` from the repo root.
2. Docker Compose starts PostgreSQL automatically.
3. The dev script creates `frontend/.env.local` and `backend/.env` from the example files if they do not exist.
4. Frontend and backend start together.

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8080
```

### Run a single app

Frontend only:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Backend only:

```bash
cd backend
cp .env.example .env
go mod tidy
go run ./cmd/api
```

### Prod-like local stack

```bash
npm run prod      # docker compose --profile prod up --build
npm run prod:down # docker compose --profile prod down
```

The `prod` profile builds the backend and frontend images. Compose ports are configurable via `BACKEND_PORT` and `FRONTEND_PORT`.

### Root commands

```bash
npm run dev
npm run dev:down
npm run prod
npm run prod:down
npm run api:types
npm run check:contract
npm run check:workflows
npm run check:secrets
npm run check
npm run e2e:install
npm run e2e
```

### Frontend commands (`frontend/`)

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run test
npm run e2e:test
npm run format
npm run typecheck
```

### Backend commands (`backend/`)

```bash
make run    # go run ./cmd/api
make build  # go build ./...
make fmt    # gofmt -w ./cmd ./internal
make tidy   # go mod tidy
make lint   # golangci-lint
```

## Demo Account

The demo user is seeded when `DEMO_SEED_ENABLED=true`:

- email: `demo@nextjs-go.local`
- password: `demo12345`

Credentials shown on the login screen come from `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD`.

## API Endpoints

Base URL: `http://localhost:8080`. The full contract lives in [`docs/openapi.yaml`](./docs/openapi.yaml).

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/health` | API health status |
| POST | `/api/v1/auth/register` | Register a new user |
| POST | `/api/v1/auth/login` | Log in with email + password |
| POST | `/api/v1/auth/verify-email` | Verify an email with a token |
| POST | `/api/v1/auth/resend-verification` | Resend a verification email |
| POST | `/api/v1/auth/forgot-password` | Request a password reset email |
| POST | `/api/v1/auth/reset-password` | Reset a password with a token |
| POST | `/api/v1/auth/refresh` | Rotate a refresh token into a new session pair |
| POST | `/api/v1/auth/logout` | Revoke a refresh token |
| GET | `/api/v1/auth/me` | Get the current user (bearer auth) |
| GET | `/api/v1/analytics/overview` | Owner-only analytics overview (bearer auth) |

Authenticated routes expect:

```text
Authorization: Bearer <access_token>
```

## API Contracts

- `docs/openapi.yaml` is the source of truth for the HTTP contract exposed by the Go API.
- `frontend/src/generated/openapi.ts` is generated from that spec with `openapi-typescript`.
- Run `npm run api:types` after changing API routes, payloads, or response shapes so the frontend stays aligned with the backend.
- Run `npm run check:contract` to ensure generated types are committed and in sync.

## Environment Variables

Copy each `*.example` file to its real counterpart. Generated env files are gitignored; examples are the source of truth.

### Backend (`backend/.env`)

Application:

```text
APP_NAME
APP_ENV
APP_PORT
APP_HOST
APP_BASE_URL
FRONTEND_APP_URL
CORS_ALLOWED_ORIGINS
```

Database:

```text
DATABASE_URL
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_SSLMODE
DB_SCHEMA
```

Auth / JWT:

```text
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_TTL_MINUTES
JWT_REFRESH_TTL_HOURS
```

Mail (password reset / verification):

```text
MAIL_FROM
RESEND_API_KEY
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
```

Analytics / owner:

```text
ANALYTICS_PROVIDER
DASHBOARD_OWNER_EMAIL
PLAUSIBLE_BASE_URL
PLAUSIBLE_SITE_ID
PLAUSIBLE_API_TOKEN
```

Demo seeding:

```text
DEMO_SEED_ENABLED
DEMO_USER_EMAIL
DEMO_USER_PASSWORD
DEMO_USER_USERNAME
DEMO_USER_FULL_NAME
```

Notes:

- `DATABASE_URL` is preferred in production; otherwise the discrete `DB_*` variables are used.
- `PORT` is supported automatically for Railway/Render/Fly-style platforms.
- `CORS_ALLOWED_ORIGINS` should include your frontend app URL.
- Production refuses to boot with a placeholder `JWT_ACCESS_SECRET`.

### Frontend (`frontend/.env.local`)

```text
NEXT_PUBLIC_APP_NAME
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL
NEXT_PUBLIC_PLAUSIBLE_DOMAIN
NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC
NEXT_PUBLIC_DEMO_EMAIL
NEXT_PUBLIC_DEMO_PASSWORD
```

### Docker Compose (shell / `.env`)

```text
BACKEND_PORT
FRONTEND_PORT
NEXT_PUBLIC_API_BASE_URL
```

## Usage

- Open the landing page at `http://localhost:3000`.
- Register a new account or log in with the demo account to reach the dashboard.
- The dashboard is an owner-only workspace; owner access is determined by `DASHBOARD_OWNER_EMAIL` (backend) and `NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL` (frontend).
- Branding and landing copy are centralized in `frontend/src/lib/site-copy.ts`.

## Quality Gates

- `npm run check` runs frontend lint (strict), format check, typecheck, unit tests, production build, plus backend tests and build.
- `npm run check:contract` reruns OpenAPI type generation and fails if `frontend/src/generated/openapi.ts` drifted.
- `npm run check:workflows` lints GitHub Actions workflows with `actionlint`.
- `npm run check:secrets` scans tracked git content with `gitleaks`.
- `npm run e2e:install` installs the Playwright browser (run once on a new machine).
- `npm run e2e` starts PostgreSQL, the Go API, and the Next.js app before running Playwright smoke tests.

## Security Automation

- CodeQL scans JavaScript/TypeScript and Go code on GitHub.
- `gitleaks` scans tracked content for secrets in CI.
- Dependabot keeps npm, Go modules, and GitHub Actions dependencies updated weekly.

## Subproject Docs

- [frontend/README.md](./frontend/README.md)
- [backend/README.md](./backend/README.md)

## Project Docs

- [Security](./docs/security.md)
- [Tooling](./docs/tooling.md)
- [Rename guide](./docs/rename.md)
- [Removing auth](./docs/remove-auth.md)
- [UI/UX guidelines](./docs/ui-ux-guidelines.md)

## Notes

- Frontend auth tokens are stored in memory instead of persistent browser storage.
- Public auth endpoints are rate-limited in-memory; put an edge limiter in front for multi-replica deployments.
- Demo seeding can provision a ready-to-use account for local development.
- Backend migration SQL lives in two synced copies — `backend/migrations/` (manual deploys) and `backend/internal/repository/migrations/` (embedded into the binary). Keep both identical when adding a migration.

## License

MIT — see [LICENSE](./LICENSE).
