# Removing Auth

This template ships with full auth flows. If your project does not need
accounts, remove auth in this order. Each step keeps `npm run check` and
`go build ./...` green if you follow it completely.

## Backend

1. Delete the registration call in
   `backend/internal/server/router.go` (`registerAuthRoutes`) and the
   function itself.
2. Delete `backend/internal/handler/http/auth_handler.go`.
3. Delete auth methods from `backend/internal/service/auth_service.go`
   (`Register`, `Login`, `Refresh`, `Logout`, `Me`, `ForgotPassword`,
   `ResetPassword`, `VerifyEmail`, `ResendVerificationEmail`,
   `buildAuthResponse`) — or the whole file if nothing else uses it.
4. Decide what stays in `backend/internal/repository/user_repository.go`:
   keep user CRUD if your app still has users, drop the token methods
   (`*PasswordResetToken*`, `*EmailVerificationToken*`,
   `*RefreshToken*`) otherwise.
5. Drop the token tables. Easiest is a new migration, e.g.
   `migrations/000006_drop_auth_tokens.up.sql`:
   ```sql
   DROP TABLE IF EXISTS password_reset_tokens;
   DROP TABLE IF EXISTS email_verification_tokens;
   DROP TABLE IF EXISTS user_sessions;
   ```
   Mirror it into `internal/repository/migrations/` (see
   backend README, Database section).
6. Remove auth env from `backend/.env.example` (`JWT_*`, `MAIL_*`,
   `SMTP_*`, `DEMO_*`, `DASHBOARD_OWNER_EMAIL`) and the
   `ValidateProduction` JWT check in
   `backend/internal/config/config.go` if it no longer applies.
7. Adapt or delete the analytics owner route in `router.go`
   (`ownerOnlyMiddleware` depends on authenticated users).

## Frontend

1. Delete `frontend/src/features/auth/` entirely.
2. Delete route groups `frontend/src/app/(auth)/` and
   `frontend/src/app/(workspace)/`.
3. In `frontend/src/components/providers.tsx`, remove `AuthBootstrap`.
4. In `frontend/src/components/site-header.tsx` and
   `frontend/src/components/mobile-bottom-nav.tsx`, remove the
   session hooks, login/signup buttons, and logout actions.
5. Remove auth env from `frontend/.env.example`
   (`NEXT_PUBLIC_API_BASE_URL` stays if you keep the Go API,
   `NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL` and `NEXT_PUBLIC_DEMO_*` go).
6. Update `frontend/e2e/smoke.spec.ts`: drop the login test and any
   dashboard-owner assertions; keep the public-pages test.
7. Delete auth types from `frontend/src/types/auth.ts` (or the file).

## Contract

1. Delete the `/api/v1/auth/*` paths and the `*Input`/`AuthResponse`
   schemas you no longer serve from `docs/openapi.yaml`.
2. Run `npm run api:types` and `npm run check:contract`.

## Verify

```bash
npm run check:contract
npm run check
npm run e2e
```
