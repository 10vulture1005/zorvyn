# Finance Data Processing and Access Control Backend

This is a robust backend system designed for managing financial records, users, and dashboard analytics. It implements **Role-Based Access Control (RBAC)**, **JWT Authentication**, and comprehensive APIs.

## Tech Stack
- **Node.js & Express**: Core framework
- **TypeScript**: Static typing
- **Prisma & SQLite**: ORM and Database
- **Zod**: Input Validation
- **Jest & Supertest**: Integration testing
- **Express Rate Limit**: Basic API protection
- **Swagger**: API Documentation

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database**
   ```bash
   npx prisma migrate dev --name init
   # or
   npx prisma db push && npx prisma generate
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   | Variable | Description | Example |
   |----------|-------------|---------|
   | `PORT` | API Port | `3000` |
   | `DATABASE_URL` | Prisma DB URL | `file:./dev.db` |
   | `JWT_SECRET` | Secret for Access Token | `super_secret` |
   | `REFRESH_SECRET`| Secret for Refresh Token| `refresh_secret` |
   | `JWT_EXPIRES_IN`| Time before token dies | `1h` |

4. **Run Server**
   ```bash
   npm run dev
   # or via ts-node
   npx ts-node src/server.ts
   ```

## Role Permissions Matrix

| Role | Financial Records CRUD | Dashboard | Audit Logs |
|------|------------------------|-----------|------------|
| **Viewer** | View denied | View denied | View denied |
| **Analyst**| Read-only access | Full access | View denied |
| **Admin** | Create, Update, Soft Delete, Purge, Restore, Read | Full access | Full access |

## API Endpoints

Check `/docs` endpoint after starting server for interactive Swagger UI testing.

**Authentication**
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Login to get JWT
- `POST /api/auth/refresh` - Refresh JWT tokens

**Financial Records**
- `GET /api/records` - List out paginated records `?limit=10&cursor=...&startDate=...`
- `POST /api/records` - Produce new record
- `PUT /api/records/:id` - Edit
- `DELETE /api/records/:id` - Soft Delete
- `POST /api/records/:id/restore` - Restore soft deleted
- `DELETE /api/records/:id/purge` - Hard Delete

**Dashboard & Audit**
- `GET /api/dashboard/summary` - Metrics, Top Categories, Trends
- `GET /api/audit` - Internal mutation logs

## Assumptions
- For simplicity, `SQLite` was used. In a production environment with this exact schema, `PostgreSQL` is recommended and supported fully by `Prisma`.
- Rate limiting is configured for *all* API endpoints via `express-rate-limit` using an in-memory store.
- Testing handles its own database truncation, clearing local SQLite test data on startup.
