# Next.js (App Router, TypeScript) Single Admin Email + OTP Backend

A production-ready Next.js 15+ App Router backend API implementation using PostgreSQL, Prisma ORM, Bcrypt OTP hashing, 10-minute OTP expiration, JWT `httpOnly` cookie sessions, and Middleware route protection.

---

## 🗄️ PostgreSQL Setup in pgAdmin 4

Follow these 4 steps to run the backend database in **pgAdmin 4**:

1. Open **pgAdmin 4** and connect to your PostgreSQL Server.
2. Create a new Database named: `jaxmart_db`
3. Right-click `jaxmart_db` ➔ Click **Query Tool**.
4. Open the SQL DDL file: [pgadmin_schema.sql](file:///e:/jaxmart_captain/jaxmart_captain/backend/pgadmin_schema.sql)
5. Paste the SQL code into the Query Tool and press **Execute (F5)**.

---

## 📁 File Structure

```text
e:\jaxmart_captain\jaxmart_captain\backend/
├── pgadmin_schema.sql                  # PostgreSQL DDL Script for pgAdmin 4
└── nextjs-otp-admin/
    ├── app/
    │   ├── api/
    │   │   └── auth/
    │   │       ├── send-otp/route.ts   # Generates 6-digit OTP, bcrypt hashes it, sets 10-min expiry
    │   │       ├── verify-otp/route.ts # Verifies bcrypt hash & expiry, issues JWT httpOnly cookie
    │   │       └── logout/route.ts     # Clears httpOnly session cookie
    │   └── dashboard/
    │       └── page.tsx                # Protected Admin Dashboard route
    ├── lib/
    │   ├── prisma.ts                   # Prisma Client singleton
    │   └── jwt.ts                      # JWT signing, verification & cookie utilities
    ├── middleware.ts                   # App Router Middleware protecting /dashboard
    └── prisma/
        └── schema.prisma               # PostgreSQL Admin & Otp models
```

---

## ⚙️ Environment Variables (.env)

```env
DATABASE_URL="postgresql://postgres:123456@localhost:5432/jaxmart_db?schema=public"
JWT_SECRET="super-secret-jaxmart-b2b-jwt-key-2026"
ADMIN_EMAIL="jaxmart@gmail.com"
DEFAULT_OTP="123456"
NODE_ENV="development"
```

---

## 🚀 Setup & Execution

```bash
# 1. Install dependencies
cd backend/nextjs-otp-admin
npm install @prisma/client bcryptjs jose next react react-dom
npm install -D prisma @types/bcryptjs @types/node typescript

# 2. Generate Prisma Client
npx prisma generate

# 3. Start Next.js Development Server
npm run dev
```

---

## 🧪 Testing API Endpoints (cURL)

### 1. Send OTP (`POST /api/auth/send-otp`)
```bash
curl -X POST http://localhost:3000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "jaxmart@gmail.com"}'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP generated and sent to admin email successfully. Expires in 10 minutes.",
  "expiresAt": "2026-08-11T15:13:00.000Z",
  "defaultOtp": "123456"
}
```

---`

### 2. Verify OTP (`POST /api/auth/verify-otp`)
```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "jaxmart@gmail.com", "otp": "123456"}' \
  -c cookies.txt
```

**Response:**
```json
{
  "success": true,
  "message": "Admin OTP verified successfully. Session initialized.",
  "admin": {
    "id": "USR-SA-001",
    "email": "jaxmart@gmail.com",
    "name": "Jaxmart Super Admin"
  }
}
```
*(Sets secure `httpOnly` cookie `admin_session_token` valid for 24h)*

---

### 3. Access Protected Route (`GET /dashboard`)
```bash
curl -i http://localhost:3000/dashboard -b cookies.txt
```
