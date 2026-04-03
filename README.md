# ZORVYN — Finance Dashboard

A full-stack finance management system with role-based access control, audit logging, and cursor-based pagination.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (via Prisma ORM) |
| Auth | JWT (access + refresh tokens), bcrypt |
| Validation | Zod |
| Docs | Swagger UI at `/docs` |
| Tests | Jest + Supertest |

---

## Project Structure

```
zorvyn/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/         # env + JWT config
│   │   ├── controllers/    # auth, records, dashboard, audit
│   │   ├── middlewares/    # auth, role, validation, error
│   │   ├── routes/         # express routers
│   │   ├── services/       # audit logging service
│   │   ├── utils/          # bcrypt + JWT helpers
│   │   └── validators/     # zod schemas
│   └── tests/
└── frontend/
    └── src/app/
        ├── page.tsx         # /        Login
        ├── signup/          # /signup  Register
        ├── dashboard/       # /dashboard
        ├── records/         # /records
        └── audit/           # /audit
```

---

## Architecture

```mermaid
graph TD
    Browser["Browser (Next.js)"]

    subgraph Frontend
        Login["/  Login"]
        Signup["/signup  Register"]
        Dashboard["/dashboard  Summary + Trends"]
        Records["/records  CRUD + Filters"]
        Audit["/audit  Audit Logs"]
    end

    subgraph Backend ["Backend (Express)"]
        AuthR["/api/auth"]
        RecR["/api/records"]
        DashR["/api/dashboard"]
        AuditR["/api/audit"]
        MW["authenticate → requireRoles → validate"]
    end

    DB[(PostgreSQL)]

    Browser --> Login & Signup & Dashboard & Records & Audit
    Login & Signup --> AuthR
    Dashboard --> DashR
    Records --> RecR
    Audit --> AuditR

    AuthR & RecR & DashR & AuditR --> MW --> DB
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB

    Client->>API: POST /api/auth/register { email, password, role }
    API->>DB: Check email unique, create user
    DB-->>API: User record
    API-->>Client: { accessToken, refreshToken, user }

    Client->>API: POST /api/auth/login { email, password }
    API->>DB: Find user, compare bcrypt hash
    DB-->>API: User record
    API-->>Client: { accessToken, refreshToken, user }

    Client->>API: GET /api/records (Bearer accessToken)
    API->>API: authenticate middleware verifies JWT
    API->>API: requireRoles checks role
    API-->>Client: Records data

    Client->>API: POST /api/auth/refresh { refreshToken }
    API->>DB: Verify user still active
    API-->>Client: New { accessToken, refreshToken }
```

---

## Role-Based Access Control

```mermaid
graph LR
    subgraph Roles
        V[Viewer]
        A[Analyst]
        AD[Admin]
    end

    subgraph Endpoints
        REG["POST /auth/register ✦ public"]
        LOG["POST /auth/login ✦ public"]
        REF["POST /auth/refresh ✦ public"]
        DASH["GET /dashboard/summary"]
        LREC["GET /records"]
        GREC["GET /records/:id"]
        CREC["POST /records"]
        UREC["PUT /records/:id"]
        DREC["DELETE /records/:id"]
        RREC["POST /records/:id/restore"]
        PREC["DELETE /records/:id/purge"]
        ALOG["GET /audit"]
    end

    V -.->|no access| DASH & LREC & GREC & CREC & UREC & DREC & RREC & PREC & ALOG
    A --> DASH & LREC & GREC
    AD --> DASH & LREC & GREC & CREC & UREC & DREC & RREC & PREC & ALOG
```

---

## Data Model

```mermaid
erDiagram
    User {
        String id PK
        String email
        String password
        String role
        String status
        DateTime createdAt
        DateTime updatedAt
    }

    FinancialRecord {
        String id PK
        Float amount
        String type
        String category
        DateTime date
        String notes
        String userId FK
        DateTime createdAt
        DateTime updatedAt
        DateTime deletedAt
    }

    AuditLog {
        String id PK
        String userId
        String action
        String entityType
        String entityId
        Json beforeState
        Json afterState
        DateTime timestamp
    }

    User ||--o{ FinancialRecord : "owns"
    User ||--o{ AuditLog : "generates"
```

---

## Record Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Active : POST /records (create)
    Active --> SoftDeleted : DELETE /records/:id
    SoftDeleted --> Active : POST /records/:id/restore
    SoftDeleted --> [*] : DELETE /records/:id/purge
```

---

## API Reference

### Auth — public

| Method | Endpoint | Body |
|---|---|---|
| POST | `/api/auth/register` | `email, password, role?` |
| POST | `/api/auth/login` | `email, password` |
| POST | `/api/auth/refresh` | `refreshToken` |

### Records — requires JWT

| Method | Endpoint | Role | Notes |
|---|---|---|---|
| GET | `/api/records` | Analyst, Admin | `?limit, cursor, type, category, startDate, endDate` |
| GET | `/api/records/:id` | Analyst, Admin | |
| POST | `/api/records` | Admin | |
| PUT | `/api/records/:id` | Admin | |
| DELETE | `/api/records/:id` | Admin | Soft delete |
| POST | `/api/records/:id/restore` | Admin | |
| DELETE | `/api/records/:id/purge` | Admin | Hard delete |

### Dashboard — requires JWT

| Method | Endpoint | Role |
|---|---|---|
| GET | `/api/dashboard/summary` | Analyst, Admin |

Returns `totalIncome`, `totalExpenses`, `netBalance`, `topCategories`, `monthlyTrends`.

### Audit — requires JWT

| Method | Endpoint | Role | Notes |
|---|---|---|---|
| GET | `/api/audit` | Admin | `?userId, entityId, limit` |

---

## Setup

### Prerequisites

- Node.js 18+
- Docker (for PostgreSQL)

### 1. Start the database

```bash
cd backend
docker compose up -d
```

### 2. Backend

```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Backend runs on `http://localhost:8000`
Swagger UI at `http://localhost:8000/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### Environment Variables

**backend/.env**
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/finance_db"
JWT_SECRET="your_jwt_secret"
REFRESH_SECRET="your_refresh_secret"
PORT=8000
```

**frontend/.env**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Seed Accounts

After running `npm run seed`:

| Email | Password | Role |
|---|---|---|
| admin@zorvyn.com | password123 | Admin |
| analyst@zorvyn.com | password123 | Analyst |
| viewer@zorvyn.com | password123 | Viewer |

---

## Running Tests

```bash
cd backend
npm test
```

Tests cover record creation, role enforcement (403 for Viewer), date range filtering, and dashboard summary aggregation.

---

## Rate Limiting

All `/api/*` routes are limited to **30 requests/minute** per IP via `express-rate-limit`.
