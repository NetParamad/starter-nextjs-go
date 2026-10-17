[English](README.md) | [ไทย](README.th.md)

# Template Next.js Go

[![license](https://img.shields.io/github/license/netparamad/template-nextjs-go)](./LICENSE)

เทมเพลต monorepo แบบ full-stack ที่สร้างด้วย Next.js, Go และ PostgreSQL — ประกอบด้วยแอป frontend สมัยใหม่ พร้อม API แบบ Go ที่แยกเลเยอร์ชัดเจน ระบบ authentication, แดชบอร์ดแบบป้องกันการเข้าถึง, การพัฒนาในเครื่องผ่าน Docker และชุดตรวจสอบคุณภาพที่พร้อมสำหรับ CI

## ภาพรวม

เทมเพลตนี้ให้ประสบการณ์การพัฒนาแบบ frontend starter ที่ขัดเกลาแล้ว ผสานกับ backend แบบ Go ที่คำนึงถึงการใช้งานจริงในระดับ production พร้อม workflow แบบ monorepo ร่วมกัน และพฤติกรรม auth ที่ปลอดภัยกว่าโดยค่าเริ่มต้น

เริ่มโปรเจกต์ใหม่จากเทมเพลตนี้:

```bash
git clone https://github.com/netparamad/template-nextjs-go my-app
cd my-app
npm run dev
```

จากนั้นทำตาม [คู่มือเปลี่ยนชื่อ](./docs/rename.md) เพื่อ rebrand

frontend และ backend พัฒนาไปด้วยกัน ใช้ขั้นตอนการตั้งค่าในเครื่องเดียวกัน และถูกควบคุมผ่านคำสั่งระดับ root ดังนั้น monorepo จึงเหมาะกับโปรเจกต์นี้ (เหมาะกับทีมขนาดเล็กถึงกลางที่โปรเจกต์ผูกกันแน่นและแก้ไขไปพร้อมกัน)

## ฟีเจอร์

- โครงสร้าง monorepo ของ Next.js + Go ที่นำกลับมาใช้ซ้ำได้
- ขั้นตอน auth ครบ: สมัครสมาชิก, เข้าสู่ระบบ, ยืนยันอีเมล, รีเซ็ตรหัสผ่าน, refresh, ออกจากระบบ
- การหมุน refresh token แบบมี state (token ใช้ครั้งเดียวใน `user_sessions`) พร้อมต่ออายุฝั่ง frontend แบบเงียบ
- แดชบอร์ดแบบ owner-only และแพตเทิร์น frontend ที่พร้อมต่อ analytics
- การตั้งค่า PostgreSQL ในเครื่องผ่าน Docker Compose
- API client ที่มี type ครบ ถอดมาจาก OpenAPI contract
- token ฝั่ง frontend เก็บในหน่วยความจำ (ไม่ถูกบันทึกข้ามการ refresh ของเบราว์เซอร์)
- seed บัญชี demo สำหรับการพัฒนาในเครื่อง
- การตรวจสอบ lint, format, unit test, Playwright smoke test, production build, Go test และ Go build
- GitHub Actions, CodeQL, สแกน secret ด้วย `gitleaks` และ Dependabot

## สถาปัตยกรรม

repo นี้เป็น monorepo ที่มีสองแอปพลิเคชันใช้ toolchain ระดับ root ร่วมกัน:

- **frontend/**: แอป Next.js (App Router) จัดโครงสร้างแบบ feature-based ใน `src` มี auth, dashboard และ UI primitives ที่ใช้ร่วมกัน
- **backend/**: API แบบ Go ที่แยกเลเยอร์ (`handler` → `service` → `repository`) ใช้ PostgreSQL และ SQL migrations
- **PostgreSQL**: รันในเครื่องผ่าน Docker Compose โดย API จะรัน migration ที่ค้างอยู่ให้อัตโนมัติตอนเริ่มทำงาน
- **Contract-first API**: `docs/openapi.yaml` เป็นแหล่งข้อมูลหลัก และ `frontend/src/generated/openapi.ts` ถูก generate มาจากไฟล์นั้น

เส้นทางการเรียกใช้งาน:

```text
Browser (Next.js)
  └─ fetch → Go API (/api/v1/*) → service → repository (pgx) → PostgreSQL
```

backend ห่อ router ด้วย CORS, security headers, request ID และ request logging ส่วน endpoint auth สาธารณะถูกจำกัดอัตรา (20 ครั้ง/นาทีต่อ IP, เก็บในหน่วยความจำ) และ endpoint analytics ถูกล็อกด้วย auth + middleware แบบ owner-only

## เทคโนโลยีที่ใช้

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
- `golang.org/x/crypto` (แฮชรหัสผ่าน)
- `joho/godotenv`
- SQL migrations

**เครื่องมือ / โครงสร้างพื้นฐาน**

- Docker Compose
- GitHub Actions (CI, CodeQL)
- ESLint, Prettier, Vitest, Playwright (frontend)
- golangci-lint v2 (backend)
- Dependabot, `gitleaks`, `actionlint`

## โครงสร้างโปรเจกต์

```text
.
├── backend/            # Go API
│   ├── cmd/api/        # entrypoint (main.go)
│   ├── internal/
│   │   ├── config/     # โหลด config + ตรวจสอบฝั่ง production
│   │   ├── domain/     # โมเดลโดเมน
│   │   ├── handler/http/  # HTTP handlers
│   │   ├── repository/    # เข้าถึง DB + migrations ที่ฝังในไบนารี
│   │   ├── server/        # router + rate limiting
│   │   └── service/       # business logic
│   ├── migrations/        # SQL migrations (คู่ up/down)
│   └── Makefile           # run, build, fmt, tidy, lint
├── frontend/           # Next.js app
│   ├── src/
│   │   ├── app/        # เส้นทาง App Router ((auth), (site), (workspace))
│   │   ├── components/ # UI ร่วม (shadcn/ui, header, footer)
│   │   ├── features/   # auth/, dashboard/, home/, shared/
│   │   ├── generated/  # type ที่ generate จาก OpenAPI
│   │   ├── layouts/    # shell ของ root + route-area
│   │   ├── lib/        # api client, app config, site copy
│   │   └── types/      # TypeScript types ร่วม
│   ├── e2e/            # Playwright smoke + mobile specs
│   └── Dockerfile
├── docs/               # openapi.yaml + เอกสารโปรเจกต์
├── scripts/            # สคริปต์ dev/ตรวจสอบระดับ root
├── compose.yml         # postgres + prod profile (ไม่บังคับ)
├── package.json        # สคริปต์ root + เครื่องมือ OpenAPI
└── .github/            # workflow CI + Dependabot
```

## เริ่มต้นใช้งาน

### สิ่งที่ต้องมีก่อน

- Node.js `>=22` (ดู `.nvmrc`)
- Go 1.25+
- Docker (สำหรับ PostgreSQL ในเครื่องและ prod-like profile)

### เริ่มแบบเร็ว (Docker Compose + สคริปต์ root)

1. รัน `npm run dev` จาก root ของ repo
2. Docker Compose จะเริ่ม PostgreSQL ให้อัตโนมัติ
3. สคริปต์ dev จะสร้าง `frontend/.env.local` และ `backend/.env` จากไฟล์ example ถ้ายังไม่มี
4. frontend และ backend จะเริ่มทำงานพร้อมกัน

```text
Frontend: http://localhost:3000
Backend:  http://localhost:8080
```

### รันแอปใดแอปหนึ่ง

เฉพาะ frontend:

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

เฉพาะ backend:

```bash
cd backend
cp .env.example .env
go mod tidy
go run ./cmd/api
```

### รันแบบ prod-like ในเครื่อง

```bash
npm run prod      # docker compose --profile prod up --build
npm run prod:down # docker compose --profile prod down
```

`prod` profile จะ build image ของ backend และ frontend โดยพอร์ตของ Compose ปรับได้ผ่าน `BACKEND_PORT` และ `FRONTEND_PORT`

### คำสั่งระดับ root

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

### คำสั่งฝั่ง frontend (`frontend/`)

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

### คำสั่งฝั่ง backend (`backend/`)

```bash
make run    # go run ./cmd/api
make build  # go build ./...
make fmt    # gofmt -w ./cmd ./internal
make tidy   # go mod tidy
make lint   # golangci-lint
```

## บัญชี Demo

บัญชี demo จะถูก seed เมื่อ `DEMO_SEED_ENABLED=true`:

- email: `demo@nextjs-go.local`
- password: `demo12345`

ข้อมูลรับรองที่แสดงบนหน้า login มาจาก `NEXT_PUBLIC_DEMO_EMAIL` / `NEXT_PUBLIC_DEMO_PASSWORD`

## Endpoint ของ API

Base URL: `http://localhost:8080` contract ฉบับเต็มอยู่ใน [`docs/openapi.yaml`](./docs/openapi.yaml)

| Method | Path | คำอธิบาย |
| ------ | ---- | -------- |
| GET | `/health` | สถานะสุขภาพของ API |
| POST | `/api/v1/auth/register` | สมัครผู้ใช้ใหม่ |
| POST | `/api/v1/auth/login` | เข้าสู่ระบบด้วย email + password |
| POST | `/api/v1/auth/verify-email` | ยืนยันอีเมลด้วย token |
| POST | `/api/v1/auth/resend-verification` | ส่งอีเมลยืนยันซ้ำ |
| POST | `/api/v1/auth/forgot-password` | ขออีเมลรีเซ็ตรหัสผ่าน |
| POST | `/api/v1/auth/reset-password` | รีเซ็ตรหัสผ่านด้วย token |
| POST | `/api/v1/auth/refresh` | หมุน refresh token เป็น session คู่ใหม่ |
| POST | `/api/v1/auth/logout` | เพิกถอน refresh token |
| GET | `/api/v1/auth/me` | ดึงผู้ใช้ปัจจุบัน (bearer auth) |
| GET | `/api/v1/analytics/overview` | ภาพรวม analytics (owner-only, bearer auth) |

เส้นทางที่ต้องยืนยันตัวตนต้องส่ง:

```text
Authorization: Bearer <access_token>
```

## API Contracts

- `docs/openapi.yaml` เป็นแหล่งข้อมูลหลักของ HTTP contract ที่ API ฝั่ง Go เปิดให้ใช้
- `frontend/src/generated/openapi.ts` ถูก generate จาก spec นั้นด้วย `openapi-typescript`
- ให้รัน `npm run api:types` หลังแก้ไข route, payload หรือรูปแบบ response ของ API เพื่อให้ frontend ตรงกับ backend
- ให้รัน `npm run check:contract` เพื่อยืนยันว่า type ที่ generate ถูก commit และซิงก์กันแล้ว

## ตัวแปรสภาพแวดล้อม (Environment Variables)

คัดลอกไฟล์ `*.example` แต่ละไฟล์ไปเป็นไฟล์จริง ไฟล์ env ที่ generate จะถูก gitignore ส่วนไฟล์ example เป็นแหล่งข้อมูลหลัก

### Backend (`backend/.env`)

ส่วนแอปพลิเคชัน:

```text
APP_NAME
APP_ENV
APP_PORT
APP_HOST
APP_BASE_URL
FRONTEND_APP_URL
CORS_ALLOWED_ORIGINS
```

ฐานข้อมูล:

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

อีเมล (รีเซ็ตรหัสผ่าน / ยืนยันตัวตน):

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

หมายเหตุ:

- ใน production แนะนำให้ใช้ `DATABASE_URL` มิฉะนั้นจะใช้ตัวแปร `DB_*` แยกกัน
- รองรับ `PORT` โดยอัตโนมัติสำหรับแพลตฟอร์มแบบ Railway/Render/Fly
- `CORS_ALLOWED_ORIGINS` ควรมี URL ของแอป frontend รวมอยู่ด้วย
- production จะไม่ยอมเริ่มทำงานถ้า `JWT_ACCESS_SECRET` ยังเป็นค่า placeholder

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

## การใช้งาน

- เปิดหน้า landing ที่ `http://localhost:3000`
- สมัครบัญชีใหม่ หรือเข้าสู่ระบบด้วยบัญชี demo เพื่อเข้าสู่แดชบอร์ด
- แดชบอร์ดเป็นพื้นที่ owner-only โดยกำหนดสิทธิ์เจ้าของผ่าน `DASHBOARD_OWNER_EMAIL` (backend) และ `NEXT_PUBLIC_DASHBOARD_OWNER_EMAIL` (frontend)
- ข้อความ branding และเนื้อหาหน้า landing รวมอยู่ที่ `frontend/src/lib/site-copy.ts`

## ด่านตรวจคุณภาพ

- `npm run check` รัน lint ฝั่ง frontend (strict), ตรวจ format, typecheck, unit test, production build รวมถึง test และ build ของ backend
- `npm run check:contract` generate type จาก OpenAPI อีกครั้ง และจะ fail ถ้า `frontend/src/generated/openapi.ts` ไม่ตรงกัน
- `npm run check:workflows` ตรวจ workflow ของ GitHub Actions ด้วย `actionlint`
- `npm run check:secrets` สแกนเนื้อหาที่ track ใน git ด้วย `gitleaks`
- `npm run e2e:install` ติดตั้งเบราว์เซอร์ของ Playwright (รันครั้งเดียวเมื่อขึ้นเครื่องใหม่)
- `npm run e2e` เริ่ม PostgreSQL, Go API และแอป Next.js ก่อนรัน Playwright smoke test

## การสแกนความปลอดภัยอัตโนมัติ

- CodeQL สแกนโค้ด JavaScript/TypeScript และ Go บน GitHub
- `gitleaks` สแกนเนื้อหาที่ track เพื่อหา secret ใน CI
- Dependabot อัปเดต dependency ของ npm, Go modules และ GitHub Actions ทุกสัปดาห์

## เอกสารของโปรเจกต์ย่อย

- [frontend/README.md](./frontend/README.md)
- [backend/README.md](./backend/README.md)

## เอกสารโปรเจกต์

- [Security](./docs/security.md)
- [Tooling](./docs/tooling.md)
- [Rename guide](./docs/rename.md)
- [Removing auth](./docs/remove-auth.md)
- [UI/UX guidelines](./docs/ui-ux-guidelines.md)

## หมายเหตุ

- token ของ auth ฝั่ง frontend เก็บในหน่วยความจำแทนการเก็บถาวรในเบราว์เซอร์
- endpoint auth สาธารณะถูกจำกัดอัตราแบบ in-memory ควรมี edge limiter ด้านหน้าเมื่อ deploy หลาย replica
- demo seeding สามารถสร้างบัญชีพร้อมใช้สำหรับการพัฒนาในเครื่อง
- SQL ของ migration ฝั่ง backend มีสองสำเนาที่ต้องซิงก์กัน — `backend/migrations/` (สำหรับ deploy แบบ manual) และ `backend/internal/repository/migrations/` (ฝังในไบนารี) ต้องเหมือนกันเสมอเมื่อเพิ่ม migration

## License

MIT — ดู [LICENSE](./LICENSE)
