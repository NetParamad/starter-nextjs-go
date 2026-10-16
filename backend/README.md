# Backend Template

This is a Go backend starter for a general full-stack app. It ships with auth,
analytics endpoints, PostgreSQL support, and SQL migrations.

## Stack

- Go
- PostgreSQL
- SQL migrations
- Layered architecture with `handler`, `service`, and `repository`

## Structure

`cmd/api`, `internal`, and `migrations`

## Quick Start

1. From the repo root, run `npm run dev` to start Dockerized Postgres plus the frontend and backend together.
2. Or in this folder only: copy `.env.example` to `.env`, run `go mod tidy`, and start the API with `go run ./cmd/api`.

Server health endpoint:

```text
GET /health
```

## Implemented Endpoints

```text
GET  /health
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/verify-email
POST /api/v1/auth/resend-verification
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
GET  /api/v1/analytics/overview (owner only)
```

`/api/v1/auth/me` expects:

```text
Authorization: Bearer <access_token>
```

## Environment

Most hosts will only need these:

```text
APP_NAME=Template Next.js Go API
APP_ENV=production
PORT=8080
APP_BASE_URL=https://your-api-host.com
CORS_ALLOWED_ORIGINS=http://localhost:3000
DATABASE_URL=postgres://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
DEMO_SEED_ENABLED=true
```

Notes:
- `DATABASE_URL` is preferred in production.
- `PORT` is supported automatically for Railway/Render/Fly-style platforms.
- `CORS_ALLOWED_ORIGINS` should include your frontend app URL.
- the server now starts with graceful shutdown, request IDs, and basic security headers by default.
- public auth endpoints are rate-limited (20 requests/minute per IP, in-memory; put an edge limiter in front for multi-replica deployments).
- production refuses to boot with placeholder `JWT_ACCESS_SECRET` (`ValidateProduction`).
- demo seeding can provision a ready-to-use account for local development.

## Database

Core schema is defined in `migrations/` (`*.up.sql` / `*.down.sql` pairs,
currently `000001`–`000004`).

Apply all pending migrations before starting the API in production (the API
runs them automatically on boot via `RunMigrations`).

Migration SQL lives in two synced copies: `migrations/` (for manual
deploys) and `internal/repository/migrations/` (embedded into the binary).
Keep both identical when adding a migration.

## Deploying

Recommended setup:
- frontend: Vercel, Netlify, or your preferred host
- backend: Railway, Render, Fly.io, or your preferred host
- database: PostgreSQL-compatible provider of your choice

Suggested flow:

1. Copy this backend directory into its own repository.
2. Push the repo.
3. Provision PostgreSQL.
4. Run every `migrations/*.up.sql` file in order on that database.
5. Set the environment variables listed above.
6. Deploy using the included `Dockerfile` or native Go buildpack support.
7. Point the frontend to `https://your-api-host.com/api/v1`.

## Planned Domains

- auth
- users
- project-specific modules

## Frontend Integration

Point your frontend services to the Go backend base URL, for example:

```text
http://localhost:8080/api/v1
```

Production example:

```text
https://your-api-host.com/api/v1
```

Good first integrations:
- login
- register
- fetch current user

## Password Reset Email

Optional setup with Resend API:

```text
MAIL_FROM=onboarding@resend.dev
RESEND_API_KEY=re_your_resend_api_key
```

Notes:
- `RESEND_API_KEY` is used directly by the backend to send reset emails through Resend.
- For production, verify your own domain in Resend and use a sender like `noreply@yourdomain.com`.

Optional SMTP fallback:

```text
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASS=your_resend_smtp_password
```
