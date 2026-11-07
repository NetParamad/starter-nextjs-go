[EN](README.md) | [TH](README.th.md)

<h1 align="center">Template Next.js Go</h1>

<p align="center">
  A full-stack starter monorepo for Next.js, Go, and PostgreSQL.
</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech stack</a> ·
  <a href="#project-structure">Structure</a> ·
  <a href="#local-setup">Local setup</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#environment-variables">Environment</a> ·
  <a href="#usage">Usage</a> ·
  <a href="#notes">Notes</a>
</p>

---

## Overview

Template Next.js Go is an enterprise-grade starter monorepo featuring a Next.js App Router frontend, a high-performance Go API, PostgreSQL with PgBouncer, and Kubernetes manifests. It ships with core auth flows, workspace session management, contract-first API typing, structured audit trails, Prometheus metrics, and a fortified CI/CD pipeline with Trivy container vulnerability scanning and SBOM generation.

The two apps share root-level commands and one local workflow. `docs/openapi.yaml` is the HTTP contract, and the frontend types are generated from it. Start from the template, then follow the [rename guide](docs/rename.md) to rebrand it.

## Features

- **Next.js + Go monorepo** — frontend, backend, docs, scripts, and CI in one repository with root-level orchestration.
- **Enterprise-ready Kubernetes manifests** — production-hardened Pod security standards (`deploy/k8s`), non-root UID 65532, read-only root filesystems, dropped capabilities, HPA, PDB, Ingress TLS, `/livez`/`/readyz` probes, and graceful shutdown `preStop` hooks.
- **Core auth flows** — register, login, refresh-token rotation, logout, and `/me` profile endpoints.
- **Stateful refresh-token rotation** — single-use tokens stored in `user_sessions`, silent renewal, revocation on logout, and in-memory access tokens.
- **SOC2/GDPR audit trail** — structured JSON audit logging (`backend/internal/audit`) capturing actor, action, target, IP, and status.
- **Database timeouts & PgBouncer** — PostgreSQL statement timeouts (`statement_timeout=5000`) and PgBouncer connection pooling in Docker Compose.
- **Trusted proxy rate limiting** — IP extraction supporting Cloudflare (`CF-Connecting-IP`), NGINX (`X-Real-IP`, `X-Forwarded-For`), and direct TCP fallback.
- **Observability** — Prometheus metrics (`/metrics`) instrumenting HTTP request durations, status codes, and active in-flight requests.
- **Supply chain security & SBOM** — GitHub Actions CI runs Trivy container vulnerability scanning and Anchore SPDX SBOM generation.
- **Contract-first API client** — `docs/openapi.yaml` generates `frontend/src/generated/openapi.ts` with `openapi-typescript`.
- **Type-safe SQL queries** — `sqlc` generates type-safe Go repository queries, paired with embedded schema migrations and standalone CLI tools (`cmd/migrate`, `cmd/seed`).
- **Quality gates** — ESLint, Prettier, TypeScript, Vitest, Playwright, production build, Go test, and Go build.
- **Security automation** — GitHub Actions CI, CodeQL for JavaScript/TypeScript and Go, `govulncheck`, `gitleaks`, and Dependabot.

## Tech stack

| Area                | Choice                                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| Frontend            | [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19 · TypeScript 5.9                  |
| Styling & UI        | Tailwind CSS 4 · [shadcn/ui](https://ui.shadcn.com) · Geist · `next-themes`                           |
| Client state & data | [TanStack Query](https://tanstack.com/query) · [Zustand](https://zustand.docs.pmnd.rs) · Lucide React |
| Backend             | [Go 1.26](https://go.dev) — layered `handler` → `service` → `repository` + `sqlc`                     |
| Database            | PostgreSQL 17 (pgx v5) · PgBouncer pooler · Embedded SQL migrations                                   |
| Auth & Audit        | JWT via `golang-jwt/jwt/v5` · bcrypt password hashing · Structured JSON audit logger                  |
| API contract        | OpenAPI 3.1 (`docs/openapi.yaml`) → `openapi-typescript`                                              |
| Observability       | Prometheus metrics (`/metrics`) · Tracing (`X-Request-ID`) · Probes (`/livez`, `/readyz`, `/health`)  |
| Deployment          | Kubernetes manifests (`deploy/k8s` with HPA, PDB, Ingress) · Multi-stage Dockerfiles                  |
| Testing             | [Vitest](https://vitest.dev) + Testing Library · [Playwright](https://playwright.dev)                 |
| Tooling             | ESLint · Prettier · Husky · lint-staged · golangci-lint · Docker Compose                              |
| CI & security       | GitHub Actions · Trivy · Anchore SBOM · `govulncheck` · `npm audit` · CodeQL · `gitleaks`             |
| Runtime             | Node `>=22.23.4` (`.nvmrc` `24.22.1`) · Go 1.26.10 · `node:24.22.1-alpine` image                      |

## Project structure

```text
.
├── backend/
│   ├── cmd/
│   │   ├── api/              # API server main.go entrypoint
│   │   ├── migrate/          # standalone database migration CLI
│   │   └── seed/             # standalone database seeding CLI
│   ├── internal/
│   │   ├── audit/            # structured security audit logging
│   │   ├── config/           # env loading + production validation
│   │   ├── domain/           # domain models
│   │   ├── handler/http/     # HTTP handlers
│   │   ├── repository/       # pgx access + sqlc generated queries
│   │   ├── server/           # router, metrics, probes, rate limiting
│   │   └── service/          # business logic
│   ├── migrations/           # embedded SQL migrations (up/down)
│   ├── sqlc.yaml             # sqlc configuration
│   ├── Makefile
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/              # App Router: (auth), (site), (workspace)
│   │   ├── components/       # shared UI + shadcn/ui primitives
│   │   ├── features/         # auth/, dashboard/, home/, shared/
│   │   ├── generated/        # openapi.ts (generated and committed)
│   │   ├── layouts/          # root and route-area shells
│   │   ├── lib/              # API client, config, site copy
│   │   └── types/            # shared TypeScript types
│   ├── e2e/                  # Playwright specs
│   └── Dockerfile
├── deploy/
│   └── k8s/                  # Kubernetes production manifests (HPA, PDB, Ingress)
├── docs/                     # openapi.yaml + project guides
├── scripts/                  # dev, check, e2e, contract, secrets
├── compose.yml               # PostgreSQL + PgBouncer + prod profile
├── package.json              # root scripts + OpenAPI tooling
├── .nvmrc
└── .github/                  # CI (Trivy, SBOM), E2E, CodeQL, Dependabot
```

## Local setup

Docker Compose runs local PostgreSQL as `postgres:17-alpine` with database `app_db`, user `postgres`, password `db_password`, published on `5432`, and a named `template-nextjs-go-postgres-data` volume. The Go API applies pending migrations automatically on boot.

`npm run dev` uses `scripts/dev.mjs` to wire the stack together:

1. Create `frontend/.env.local` and `backend/.env` from their example files if missing.
2. Start PostgreSQL with `docker compose up -d postgres` and wait for readiness.
3. Start `npm run dev` in `frontend/` and `go run ./cmd/api` in `backend/`.

The optional `prod` profile builds the backend and frontend images. Compose ports are configurable through `BACKEND_PORT` and `FRONTEND_PORT`, and the frontend image receives `NEXT_PUBLIC_API_BASE_URL` as a build argument.

```bash
npm run prod       # docker compose --profile prod up --build
npm run prod:down  # docker compose --profile prod down
```

## Getting started

Requirements: **Node.js `>=22.23.4`** (`.nvmrc` pins `24.22.1`), **Go 1.25.1+**, **Docker with Compose**, and npm. The frontend Dockerfile uses `node:24.22.1-alpine`.

```bash
git clone https://github.com/netparamad/template-nextjs-go.git
cd template-nextjs-go
npm install
npm --prefix frontend install
npm run dev
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:8080`

To run one app manually:

```bash
cd frontend && cp .env.example .env.local && npm install && npm run dev
cd backend && cp .env.example .env && go run ./cmd/api
```

### Scripts

| Command                   | Description                                                |
| ------------------------- | ---------------------------------------------------------- |
| `npm run dev`             | Start Postgres, then the frontend and backend together     |
| `npm run dev:down`        | Stop the Docker Compose services                           |
| `npm run prod`            | Build and run the prod-like Compose profile                |
| `npm run prod:down`       | Stop the prod profile                                      |
| `npm run api:types`       | Regenerate `frontend/src/generated/openapi.ts`             |
| `npm run check:contract`  | Regenerate types and fail on git drift                     |
| `npm run check:workflows` | Lint GitHub Actions workflows with `actionlint`            |
| `npm run check:secrets`   | Scan tracked content with `gitleaks`                       |
| `npm run check`           | Full local gate: frontend checks, build, Go test, Go build |
| `npm run e2e:install`     | Install the Playwright Chromium browser                    |
| `npm run e2e`             | Start Postgres, the API, and the app, then run Playwright  |

Backend commands from `backend/`:

| Command      | Description                       |
| ------------ | --------------------------------- |
| `make run`   | `go run ./cmd/api`                |
| `make build` | `go build ./...`                  |
| `make fmt`   | `gofmt -w ./cmd ./internal`       |
| `make tidy`  | `go mod tidy`                     |
| `make lint`  | Run golangci-lint v2 via `go run` |

## Environment variables

Copy each `*.example` file to its real counterpart. Generated files are gitignored, and the examples are the source of truth. `npm run dev` creates them automatically.

### Backend (`backend/.env`)

| Variable                                           | Required   | Notes                                                        |
| -------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| `APP_NAME` / `APP_ENV`                             | optional   | Defaults `Template Next.js Go API` / `development`           |
| `APP_PORT` / `APP_HOST`                            | optional   | Defaults `8080` / `0.0.0.0`; platform `PORT` also works      |
| `APP_BASE_URL` / `FRONTEND_APP_URL`                | optional   | Public API and frontend origins                              |
| `CORS_ALLOWED_ORIGINS`                             | ✅         | Must include the frontend origin                             |
| `DATABASE_URL`                                     | production | Preferred when set; otherwise `DB_*` is used                 |
| `DB_HOST` / `DB_PORT` / `DB_NAME`                  | local      | Defaults `localhost` / `5432` / `app_db`                     |
| `DB_USER` / `DB_PASSWORD`                          | local      | Defaults `postgres` / `postgres`; example uses `db_password` |
| `DB_SSLMODE` / `DB_SCHEMA`                         | local      | Defaults `disable` / `public`                                |
| `JWT_ACCESS_SECRET`                                | ✅         | Must be replaced in production                               |
| `JWT_REFRESH_SECRET`                               | ✅         | Must be replaced in production                               |
| `JWT_ACCESS_TTL_MINUTES` / `JWT_REFRESH_TTL_HOURS` | optional   | Defaults `15` / `720`                                        |
| `DEMO_SEED_ENABLED`                                | local      | Enables demo-user seeding                                    |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD`           | local      | Defaults `demo@nextjs-go.local` / `demo12345`                |
| `DEMO_USER_USERNAME` / `DEMO_USER_FULL_NAME`       | local      | Defaults `nextjs-go-demo` / `Next.js Go Demo`                |

### Frontend (`frontend/.env.local`)

| Variable                                       | Required | Notes                                                    |
| ---------------------------------------------- | -------- | -------------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_URL` | optional | Defaults `Template Next.js Go` / `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL`                     | ✅       | API base, e.g. `http://localhost:8080/api/v1`            |

### Docker Compose (shell / `.env`)

| Variable                         | Required     | Notes                                                      |
| -------------------------------- | ------------ | ---------------------------------------------------------- |
| `BACKEND_PORT` / `FRONTEND_PORT` | optional     | Host ports for the API/app, defaults `8080` / `3000`       |
| `PGBOUNCER_PORT`                 | optional     | PgBouncer host port, defaults `6432`                       |
| `NEXT_PUBLIC_API_BASE_URL`       | prod profile | Build-time API URL, default `http://localhost:8080/api/v1` |

## Usage

1. Open the landing page at `http://localhost:3000`.
2. Register an account, or log in with the seeded demo account when `DEMO_SEED_ENABLED=true`.
3. Access the authenticated dashboard to inspect user session and security details.
4. Change branding and landing copy in `frontend/src/lib/site-copy.ts`; follow the [rename guide](docs/rename.md) for a full rebrand.
5. Change API routes or payloads in `docs/openapi.yaml`, then run `npm run api:types` and `npm run check:contract`.

## Notes

- **Contract generation** — never edit `frontend/src/generated/openapi.ts` by hand. Regenerate it, commit the result, and let `check:contract` catch drift in CI.
- **Auth removal** — auth can be removed by following [docs/remove-auth.md](docs/remove-auth.md); it is documented deletion, not a runtime flag.
- **CI** — `.github/workflows/template-ci.yml` runs contract, frontend, backend, and hygiene jobs; `e2e.yml` runs Playwright; `codeql.yml` scans JavaScript/TypeScript and Go. Dependabot updates npm, Go modules, and Actions weekly.
- **Deployment** — the backend README recommends a frontend host such as Vercel or Netlify, a backend host such as Railway, Render, or Fly.io, and a PostgreSQL provider. Both apps include Dockerfiles, and the API applies migrations on boot.
- **Migrations** — single source of truth in `backend/migrations/`; embedded directly into the Go binary via `embed.FS` and applied on boot.
- **Limits** — frontend tokens live in memory, and public auth endpoints are rate-limited in memory (20 requests/minute per IP). Add an edge limiter for multi-replica deployments.
- **License** — MIT, copyright netparamad. See [LICENSE](LICENSE). Subproject docs: [frontend](frontend/README.md), [backend](backend/README.md), [docs](docs/).
