# Rename Guide

How to turn this template into your own project. Work top to bottom; each
step lists the exact files and the search pattern to verify with.

Conventions used below:

- `<slug>` — URL-safe project name, e.g. `my-cool-app`
- `<Name>` — display name, e.g. `My Cool App`
- `<owner>` — GitHub user or org, e.g. `my-org`
- `<demo>` — demo/owner email domain, e.g. `demo@my-cool-app.local`

## 1. Go module and imports

- `backend/go.mod` — `module github.com/<owner>/<slug>/backend`
- Every Go import of the old module path (12+ files under
  `backend/cmd` and `backend/internal`)
- Verify: `rg 'github.com/<old-owner>/<old-slug>/backend' backend`

## 2. npm names and links

- Root `package.json` + `package-lock.json` — `"name": "<slug>"`
- `frontend/package.json` + `frontend/package-lock.json` —
  `"name": "<slug>-frontend"`
- Root `README.md` — badges, `npx @<owner>/<slug> my-app`, GitHub links
- Verify: `rg '<old-slug>' package.json package-lock.json frontend/package.json frontend/package-lock.json README.md`

## 3. Display names (env-driven, no code edits)

- `frontend/.env.example` — `NEXT_PUBLIC_APP_NAME=<Name>`
- `backend/.env.example` — `APP_NAME=<Name> API`
- `frontend/Dockerfile` — `ARG NEXT_PUBLIC_APP_NAME="<Name>"`
- `frontend/README.md`, `backend/README.md` — example env blocks
- Fallback defaults if env is missing: `frontend/src/lib/app-config.ts`
  (`DEFAULT_APP_NAME`), `backend/internal/config/config.go` (`APP_NAME`
  default), plus the assertions in `backend/internal/config/config_test.go`
  and `backend/internal/service/health_service_test.go`
- Verify: `rg '<Old Name>' frontend backend docs scripts`

## 4. Demo and owner emails

- `frontend/.env.example` — `NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL`,
  `NEXT_PUBLIC_DEMO_EMAIL`
- `backend/.env.example` — `DASHBOARD_OWNER_EMAIL`, `DEMO_USER_EMAIL`
- `frontend/Dockerfile` — the same two `ARG`s
- Code fallbacks: `backend/internal/config/config.go`
  (`DEMO_USER_EMAIL` default), `scripts/e2e.mjs`
  (`DASHBOARD_OWNER_EMAIL`, `DEMO_USER_EMAIL`, `PLAYWRIGHT_DEMO_EMAIL`),
  `frontend/e2e/smoke.spec.ts` (`demoEmail` default)
- Docs: root `README.md` demo account section
- After changing: reseed the dev database once —
  `docker compose down -v && npm run dev` (the seed upserts per email, so
  the old demo user would otherwise linger)

## 5. Infrastructure names

- `compose.yml` — `container_name` and volume
  (`<slug>-postgres`, `<slug>-postgres-data`)
- `scripts/e2e.mjs` — disposable `postgresContainer`
- `backend/Makefile` — `APP_NAME=<slug>-api`
- `backend/Dockerfile` — built binary name (3 lines)
- `scripts/dev.mjs` — startup log line (cosmetic)

## 6. API contract title

- `docs/openapi.yaml` — `info.title`
- Then run `npm run api:types` so `frontend/src/generated/openapi.ts`
  stays in sync, and `npm run check:contract` to verify

## 7. Landing and brand copy

- `frontend/src/lib/site-copy.ts` — hero, why-choose, about, footer, and
  app description in one place; components render from it, no copy lives
  in `.tsx` files
- Per-page auth copy (login/signup/verify/reset headings) stays at each
  call site — update only if your product voice differs

## 8. Git remote

- `git remote set-url origin git@github.com:<owner>/<repo>.git`
  (or remove the template remote and push to a fresh repo)

## 9. Verify the rename

```bash
rg -i '<old-slug>|<Old Name>|<old demo email>' . --glob '!node_modules' --glob '!frontend/node_modules'
npm run check:contract
npm run check
go test ./... # from backend/
npm run e2e
```
