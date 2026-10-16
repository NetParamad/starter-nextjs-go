# CONTEXT.md — Template Next.js Go

Shared vocabulary and decision log for this repo. Agents and humans: read this
before proposing changes, and append new hard-to-reverse decisions here.

## Glossary

- **Template Next.js Go**: the product name (slug `template-nextjs-go`).
  Display name in UI via `NEXT_PUBLIC_APP_NAME`, API name via `APP_NAME`.
- **Stock shadcn**: the frontend follows upstream shadcn conventions with no
  custom design language (neutral base color, Geist type, standard radius).
- **Contract**: `docs/openapi.yaml` is the source of truth for the HTTP API;
  `frontend/src/generated/openapi.ts` is generated and must stay in sync
  (`npm run check:contract`).
- **Owner flows**: routes/data visible only to the configured owner account
  (`DASHBOARD_OWNER_EMAIL` / `NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL`).

## Decisions

| Date       | Decision | Rationale |
| ---------- | -------- | --------- |
| 2026-10-16 | License: MIT, holder `netparamad` | Standard for a starter template; permissive. |
| 2026-10-16 | Owner/scope renamed `Boyeep`/`@boyeep` → `netparamad`/`@netparamad` | Single owner identity (Go module, npm scope, README). |
| 2026-10-16 | Product renamed "Next.js Go Monorepo Kit" → "Template Next.js Go" | Shorter name; slug `template-nextjs-go` everywhere. |
| 2026-10-16 | Theme reset to stock shadcn, neutral base, Geist + Geist Mono | Match https://netparamad.vercel.app/ 1:1; drop custom warm theme, scroll-reveal, glow effects. |
| 2026-10-16 | Dark mode via `next-themes` + header `ModeToggle` (light↔dark button) | No extra Radix dep; mounted guard via `useSyncExternalStore` for lint. |
| 2026-10-16 | CI lives at repo root (`.github/workflows/template-ci.yml`, `e2e.yml`) | GitHub only runs root workflows; old `frontend/.github` path never executed. |
| 2026-10-16 | Backend lint: golangci-lint v2 (no `fieldalignment`) | `fieldalignment` too strict for a template; fixed real `errcheck`/`gofmt`/`goimports` findings instead (incl. duplicate `embed` import). |
| 2026-10-16 | Security: Dependabot (npm/gomod/actions) + CodeQL (js + go) + gitleaks in CI | Makes the README's claims true. |

## Conventions

- Frontend styling: stock shadcn tokens only (`bg-background`,
  `text-muted-foreground`, ...). No hardcoded white glassmorphism. See
  `docs/ui-ux-guidelines.md`.
- Backend: `go vet` + `golangci-lint` + `go test` + `go build` must pass
  (`backend/Makefile`: `make lint`, `go test ./...`).
- Root `npm run check` is the full local gate (frontend lint/format/typecheck/
  test/build + backend test/build).
- Generated env files (`backend/.env`, `frontend/.env.local`) are gitignored;
  examples (`*.example`) are the source of truth.
