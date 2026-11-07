[EN](README.md) | [TH](README.th.md)

<h1 align="center">Template Next.js Go</h1>

<p align="center">
  เทมเพลต monorepo แบบ full-stack สำหรับ Next.js, Go และ PostgreSQL
</p>

<p align="center">
  <a href="#ภาพรวม">ภาพรวม</a> ·
  <a href="#ฟีเจอร์">ฟีเจอร์</a> ·
  <a href="#เทคโนโลยีที่ใช้">เทคโนโลยี</a> ·
  <a href="#โครงสร้างโปรเจกต์">โครงสร้าง</a> ·
  <a href="#การตั้งค่าในเครื่อง">การตั้งค่าในเครื่อง</a> ·
  <a href="#เริ่มต้นใช้งาน">เริ่มต้นใช้งาน</a> ·
  <a href="#ตัวแปรสภาพแวดล้อม">ตัวแปรสภาพแวดล้อม</a> ·
  <a href="#วิธีใช้งาน">วิธีใช้งาน</a> ·
  <a href="#หมายเหตุ">หมายเหตุ</a>
</p>

---

## ภาพรวม

Template Next.js Go เป็นเทมเพลต monorepo ที่มี frontend Next.js App Router, API Go แบบแยกเลเยอร์ และ PostgreSQL มาพร้อม auth ที่ใช้งานได้จริง แดชบอร์ดแบบ owner-only, API client แบบ contract-first, การพัฒนาในเครื่องผ่าน Docker และชุดตรวจสอบที่พร้อมสำหรับ CI เพื่อให้โปรเจกต์ใหม่เริ่มจากโครง full-stack จริงแทนไดเรกทอรีเปล่า

ทั้งสองแอปใช้คำสั่งระดับ root ร่วมกันและ workflow เดียวกัน `docs/openapi.yaml` เป็น HTTP contract และ type ฝั่ง frontend ถูก generate จากไฟล์นั้น เริ่มจากเทมเพลตนี้แล้วทำตาม [คู่มือเปลี่ยนชื่อ](docs/rename.md) เพื่อ rebrand

## ฟีเจอร์

- **Monorepo Next.js + Go** — frontend, backend, docs, scripts และ CI อยู่ใน repo เดียวพร้อมการจัดการระดับ root
- **ขั้นตอน auth ครบ** — สมัครสมาชิก, เข้าสู่ระบบ, ยืนยันอีเมล, รีเซ็ตรหัสผ่าน, refresh และออกจากระบบ
- **หมุน refresh token แบบมี state** — token ใช้ครั้งเดียวเก็บใน `user_sessions`, ต่ออายุฝั่ง frontend แบบเงียบ, เพิกถอนเมื่อ logout/เปลี่ยนรหัสผ่าน และ access token เก็บในหน่วยความจำ
- **แดชบอร์ด owner-only** — กำหนดสิทธิ์ด้วย owner email ที่ตั้งไว้ทั้งฝั่ง frontend และ backend
- **PostgreSQL ผ่าน Docker** — Docker Compose ให้ Postgres ในเครื่อง และมี `prod` profile สำหรับ build image ทั้งสองแอป
- **API client แบบ contract-first** — `docs/openapi.yaml` generate `frontend/src/generated/openapi.ts` ด้วย `openapi-typescript`
- **Seed บัญชี demo** — `DEMO_SEED_ENABLED=true` สร้างบัญชีพร้อมใช้สำหรับการพัฒนาในเครื่อง
- **ด่านตรวจคุณภาพ** — ESLint, Prettier, TypeScript, Vitest, Playwright, production build, Go test และ Go build
- **ระบบความปลอดภัยอัตโนมัติ** — GitHub Actions CI, CodeQL สำหรับ JavaScript/TypeScript และ Go, `gitleaks` และ Dependabot
- **UI แบบ stock shadcn** — ธีม neutral, ฟอนต์ Geist และ light/dark mode ผ่าน `next-themes`

## เทคโนโลยีที่ใช้

| ด้าน                       | ที่เลือกใช้                                                                                           |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| Frontend                   | [Next.js 16](https://nextjs.org) (App Router, Turbopack) · React 19 · TypeScript 5.9                  |
| Styling และ UI             | Tailwind CSS 4 · [shadcn/ui](https://ui.shadcn.com) · Geist · `next-themes`                           |
| State และ data ฝั่ง client | [TanStack Query](https://tanstack.com/query) · [Zustand](https://zustand.docs.pmnd.rs) · Lucide React |
| Backend                    | [Go 1.25](https://go.dev) — แยกเลเยอร์ `handler` → `service` → `repository`                           |
| ฐานข้อมูล                  | PostgreSQL (pgx v5) พร้อม SQL migrations                                                              |
| Auth                       | JWT ผ่าน `golang-jwt/jwt/v5` · แฮชรหัสผ่านด้วย bcrypt                                                 |
| API contract               | OpenAPI 3.1 (`docs/openapi.yaml`) → `openapi-typescript`                                              |
| Observability              | Prometheus metrics (`/metrics`) · Tracing (`X-Request-ID`)                                            |
| การทดสอบ                   | [Vitest](https://vitest.dev) + Testing Library · [Playwright](https://playwright.dev)                 |
| เครื่องมือ                 | ESLint · Prettier · Husky · lint-staged · golangci-lint · Docker Compose                              |
| CI และความปลอดภัย          | GitHub Actions · `govulncheck` · `npm audit` · CodeQL · `gitleaks`                                    |
| Runtime                    | Node `>=22.23.4` (`.nvmrc` `24.22.1`) · Go 1.25.1 · image `node:24.22.1-alpine`                       |

## โครงสร้างโปรเจกต์

```text
.
├── backend/
│   ├── cmd/api/              # entrypoint main.go
│   ├── internal/
│   │   ├── config/           # โหลด env + ตรวจสอบฝั่ง production
│   │   ├── domain/           # โมเดลโดเมน
│   │   ├── handler/http/     # HTTP handlers
│   │   ├── repository/       # เข้าถึง pgx + sqlc queries
│   │   ├── server/           # router, middleware, rate limiting
│   │   └── service/          # business logic
│   ├── migrations/           # SQL migrations ที่ฝังในไบนารี (up/down)
│   ├── Makefile
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/              # App Router: (auth), (site), (workspace)
│   │   ├── components/       # UI ร่วม + shadcn/ui primitives
│   │   ├── features/         # auth/, dashboard/, home/, shared/
│   │   ├── generated/        # openapi.ts (generate แล้ว commit)
│   │   ├── layouts/          # shell ของ root และ route-area
│   │   ├── lib/              # API client, config, site copy
│   │   └── types/            # TypeScript types ร่วม
│   ├── e2e/                  # Playwright specs
│   └── Dockerfile
├── docs/                     # openapi.yaml + คู่มือโปรเจกต์
├── scripts/                  # dev, check, e2e, contract, secrets
├── compose.yml               # PostgreSQL + prod profile (ไม่บังคับ)
├── package.json              # สคริปต์ root + เครื่องมือ OpenAPI
├── .nvmrc
└── .github/                  # CI, E2E, CodeQL, Dependabot
```

## การตั้งค่าในเครื่อง

Docker Compose รัน PostgreSQL ในเครื่องเป็น `postgres:17-alpine` ฐานข้อมูล `app_db` ผู้ใช้ `postgres` รหัสผ่าน `db_password` เปิดพอร์ต `5432` และใช้ volume ชื่อ `template-nextjs-go-postgres-data` โดย API Go จะรัน migration ที่ค้างอยู่ให้อัตโนมัติตอนเริ่มทำงาน

`npm run dev` ใช้ `scripts/dev.mjs` เชื่อมทั้ง stack เข้าด้วยกัน:

1. สร้าง `frontend/.env.local` และ `backend/.env` จากไฟล์ example ถ้ายังไม่มี
2. เริ่ม PostgreSQL ด้วย `docker compose up -d postgres` และรอจนพร้อม
3. เริ่ม `npm run dev` ใน `frontend/` และ `go run ./cmd/api` ใน `backend/`

`prod` profile (ไม่บังคับ) จะ build image ของ backend และ frontend โดยพอร์ตของ Compose ปรับได้ผ่าน `BACKEND_PORT` และ `FRONTEND_PORT` และ image ฝั่ง frontend รับ `NEXT_PUBLIC_API_BASE_URL` เป็น build argument

```bash
npm run prod       # docker compose --profile prod up --build
npm run prod:down  # docker compose --profile prod down
```

## เริ่มต้นใช้งาน

ความต้องการ: **Node.js `>=22.23.4`** (`.nvmrc` กำหนด `24.22.1`), **Go 1.25.1+**, **Docker พร้อม Compose** และ npm โดย Dockerfile ฝั่ง frontend ใช้ `node:24.22.1-alpine`

```bash
git clone https://github.com/netparamad/template-nextjs-go.git
cd template-nextjs-go
npm install
npm --prefix frontend install
npm run dev
```

Frontend: `http://localhost:3000` · Backend: `http://localhost:8080`

การรันแอปเดียวด้วยตนเอง:

```bash
cd frontend && cp .env.example .env.local && npm install && npm run dev
cd backend && cp .env.example .env && go run ./cmd/api
```

### คำสั่งสคริปต์

| คำสั่ง                    | คำอธิบาย                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| `npm run dev`             | เริ่ม Postgres แล้วเปิด frontend กับ backend พร้อมกัน            |
| `npm run dev:down`        | หยุดบริการของ Docker Compose                                     |
| `npm run prod`            | Build และรัน Compose profile แบบ prod-like                       |
| `npm run prod:down`       | หยุด prod profile                                                |
| `npm run api:types`       | Generate `frontend/src/generated/openapi.ts` ใหม่                |
| `npm run check:contract`  | Generate type ใหม่และ fail ถ้าเกิด git drift                     |
| `npm run check:workflows` | ตรวจ workflow ของ GitHub Actions ด้วย `actionlint`               |
| `npm run check:secrets`   | สแกนเนื้อหาที่ track ด้วย `gitleaks`                             |
| `npm run check`           | ด่านตรวจเต็มในเครื่อง: frontend checks, build, Go test, Go build |
| `npm run e2e:install`     | ติดตั้งเบราว์เซอร์ Chromium ของ Playwright                       |
| `npm run e2e`             | เริ่ม Postgres, API และแอป แล้วรัน Playwright                    |

คำสั่งฝั่ง backend จาก `backend/`:

| คำสั่ง       | คำอธิบาย                           |
| ------------ | ---------------------------------- |
| `make run`   | `go run ./cmd/api`                 |
| `make build` | `go build ./...`                   |
| `make fmt`   | `gofmt -w ./cmd ./internal`        |
| `make tidy`  | `go mod tidy`                      |
| `make lint`  | รัน golangci-lint v2 ผ่าน `go run` |

## ตัวแปรสภาพแวดล้อม

คัดลอกไฟล์ `*.example` แต่ละไฟล์ไปเป็นไฟล์จริง ไฟล์ที่ generate จะถูก gitignore และไฟล์ example เป็นแหล่งข้อมูลหลัก (`npm run dev` สร้างให้อัตโนมัติ)

### Backend (`backend/.env`)

| ตัวแปร                                             | จำเป็น      | หมายเหตุ                                                       |
| -------------------------------------------------- | ----------- | -------------------------------------------------------------- |
| `APP_NAME` / `APP_ENV`                             | ไม่บังคับ   | ค่าเริ่มต้น `Template Next.js Go API` / `development`          |
| `APP_PORT` / `APP_HOST`                            | ไม่บังคับ   | ค่าเริ่มต้น `8080` / `0.0.0.0`; รองรับ `PORT` ของแพลตฟอร์มด้วย |
| `APP_BASE_URL` / `FRONTEND_APP_URL`                | ไม่บังคับ   | origin ของ API และ frontend ที่ใช้ในอีเมล                      |
| `CORS_ALLOWED_ORIGINS`                             | ✅          | ต้องมี origin ของ frontend                                     |
| `DATABASE_URL`                                     | production  | ใช้ก่อนเมื่อตั้งค่าไว้; ถ้าไม่ตั้งจะใช้ `DB_*`                 |
| `DB_HOST` / `DB_PORT` / `DB_NAME`                  | local       | ค่าเริ่มต้น `localhost` / `5432` / `app_db`                    |
| `DB_USER` / `DB_PASSWORD`                          | local       | ค่าเริ่มต้น `postgres` / `postgres`; ตัวอย่างใช้ `db_password` |
| `DB_SSLMODE` / `DB_SCHEMA`                         | local       | ค่าเริ่มต้น `disable` / `public`                               |
| `JWT_ACCESS_SECRET`                                | ✅          | ต้องเปลี่ยนเป็นค่าจริงใน production                            |
| `JWT_REFRESH_SECRET`                               | ✅          | ต้องเปลี่ยนเป็นค่าจริงใน production                            |
| `JWT_ACCESS_TTL_MINUTES` / `JWT_REFRESH_TTL_HOURS` | ไม่บังคับ   | ค่าเริ่มต้น `15` / `720`                                       |
| `MAIL_FROM` / `RESEND_API_KEY`                     | สำหรับอีเมล | ผู้ส่ง + คีย์ Resend สำหรับอีเมลยืนยัน/รีเซ็ต                  |
| `SMTP_HOST` / `SMTP_PORT`                          | ไม่บังคับ   | SMTP ทางเลือกสำรอง; พอร์ตเริ่มต้น `587`                        |
| `SMTP_USER` / `SMTP_PASS`                          | ไม่บังคับ   | ข้อมูลรับรอง SMTP                                              |
| `ANALYTICS_PROVIDER`                               | ไม่บังคับ   | ตัวอย่างใช้ `plausible`                                        |
| `DASHBOARD_OWNER_EMAIL`                            | owner flows | ตรวจสิทธิ์เจ้าของฝั่ง backend                                  |
| `PLAUSIBLE_BASE_URL`                               | ไม่บังคับ   | ค่าเริ่มต้น `https://plausible.io`                             |
| `PLAUSIBLE_SITE_ID` / `PLAUSIBLE_API_TOKEN`        | ไม่บังคับ   | site identifier + API token ฝั่งเซิร์ฟเวอร์                    |
| `DEMO_SEED_ENABLED`                                | local       | เปิดการ seed ผู้ใช้ demo                                       |
| `DEMO_USER_EMAIL` / `DEMO_USER_PASSWORD`           | local       | ค่าเริ่มต้น `demo@nextjs-go.local` / `demo12345`               |
| `DEMO_USER_USERNAME` / `DEMO_USER_FULL_NAME`       | local       | ค่าเริ่มต้น `nextjs-go-demo` / `Next.js Go Demo`               |

### Frontend (`frontend/.env.local`)

| ตัวแปร                                                              | จำเป็น      | หมายเหตุ                                                    |
| ------------------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME` / `NEXT_PUBLIC_APP_URL`                      | ไม่บังคับ   | ค่าเริ่มต้น `Template Next.js Go` / `http://localhost:3000` |
| `NEXT_PUBLIC_API_BASE_URL`                                          | ✅          | base ของ API เช่น `http://localhost:8080/api/v1`            |
| `NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL`                                 | owner flows | ตรวจสิทธิ์เจ้าของฝั่ง frontend                              |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` / `NEXT_PUBLIC_PLAUSIBLE_SCRIPT_SRC` | ไม่บังคับ   | domain + URL สคริปต์ของ Plausible                           |
| `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD`              | local       | ข้อมูลรับรอง demo ที่แสดงบนหน้า login                       |

### Docker Compose (shell / `.env`)

| ตัวแปร                           | จำเป็น       | หมายเหตุ                                                         |
| -------------------------------- | ------------ | ---------------------------------------------------------------- |
| `BACKEND_PORT` / `FRONTEND_PORT` | ไม่บังคับ    | พอร์ต host ของ API/แอป ค่าเริ่มต้น `8080` / `3000`               |
| `NEXT_PUBLIC_API_BASE_URL`       | prod profile | URL ของ API ตอน build ค่าเริ่มต้น `http://localhost:8080/api/v1` |

## วิธีใช้งาน

1. เปิดหน้า landing ที่ `http://localhost:3000`
2. สมัครบัญชี หรือเข้าสู่ระบบด้วยบัญชี demo ที่ seed ไว้เมื่อ `DEMO_SEED_ENABLED=true`
3. เข้าสู่แดชบอร์ด ซึ่งเห็นได้เฉพาะเจ้าของที่กำหนดผ่าน `DASHBOARD_OWNER_EMAIL` และ `NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL`
4. เปลี่ยน branding และข้อความหน้า landing ที่ `frontend/src/lib/site-copy.ts`; ทำตาม [คู่มือเปลี่ยนชื่อ](docs/rename.md) สำหรับ rebrand ทั้งหมด
5. เปลี่ยน route หรือ payload ของ API ใน `docs/openapi.yaml` แล้วรัน `npm run api:types` และ `npm run check:contract`

## หมายเหตุ

- **การ generate contract** — ห้ามแก้ `frontend/src/generated/openapi.ts` ด้วยมือ ให้ generate ใหม่ commit ผลลัพธ์ และให้ `check:contract` จับ drift ใน CI
- **การลบ auth** — ลบ auth ได้โดยทำตาม [docs/remove-auth.md](docs/remove-auth.md); เป็นการลบตามเอกสาร ไม่ใช่ runtime flag
- **CI** — `.github/workflows/template-ci.yml` รัน job contract, frontend, backend และ hygiene; `e2e.yml` รัน Playwright; `codeql.yml` สแกน JavaScript/TypeScript และ Go ส่วน Dependabot อัปเดต npm, Go modules และ Actions รายสัปดาห์
- **การดีพลอย** — README ฝั่ง backend แนะนำ frontend host เช่น Vercel หรือ Netlify, backend host เช่น Railway, Render หรือ Fly.io และ PostgreSQL provider โดยทั้งสองแอปมี Dockerfile และ API รัน migration ตอนเริ่มทำงาน
- **Migrations** — จัดเก็บที่เดียวใน `backend/migrations/` โดยฝังในไบนารี Go ด้วย `embed.FS` และรันอัตโนมัติเมื่อเริ่มทำงาน
- **ข้อจำกัด** — token ฝั่ง frontend เก็บในหน่วยความจำ และ endpoint auth สาธารณะถูกจำกัดอัตราในหน่วยความจำ (20 ครั้ง/นาทีต่อ IP) ควรเพิ่ม edge limiter เมื่อ deploy หลาย replica
- **สัญญาอนุญาต** — MIT, copyright netparamad ดู [LICENSE](LICENSE) เอกสารโปรเจกต์ย่อย: [frontend](frontend/README.md), [backend](backend/README.md), [docs](docs/)
