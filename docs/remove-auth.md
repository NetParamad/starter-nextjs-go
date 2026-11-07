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
   (`Register`, `Login`, `Refresh`, `Logout`, `Me`, `buildAuthResponse`) —
   or the whole file if nothing else uses it.
4. Decide what stays in `backend/internal/repository/user_repository.go`:
   keep user CRUD if your app still has users, drop the session methods
   (`*RefreshToken*`) otherwise.
5. Drop the session table. Easiest is a new migration, e.g.
   `migrations/000002_drop_user_sessions.up.sql`:
   ```sql
   DROP TABLE IF EXISTS user_sessions;
   ```
   The API will automatically embed and run it on next boot.
6. Remove auth env from `backend/.env.example` (`JWT_*`,
   `DEMO_*`) and the
   `ValidateProduction` JWT check in
   `backend/internal/config/config.go` if it no longer applies.

## Frontend

1. Delete `frontend/src/features/auth/` entirely.
2. Delete route groups `frontend/src/app/(auth)/` and
   `frontend/src/app/(workspace)/`.
3. In `frontend/src/components/providers.tsx`, remove `AuthBootstrap`.
4. In `frontend/src/components/site-header.tsx` and
   `frontend/src/components/mobile-bottom-nav.tsx`, remove the
   session hooks, login/signup buttons, and logout actions.
5. Update `frontend/e2e/smoke.spec.ts`: drop the login test and
   dashboard assertions; keep the public-pages test.
6. Delete auth types from `frontend/src/types/auth.ts` (or the file).

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
