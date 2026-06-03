# Aasa Inventory Management Platform

A full-stack, production-ready inventory management platform with role-based access control, unit conversion, quotation workflows, and order management.

---

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React + Vite + TypeScript + Tailwind CSS       |
| Backend    | Node.js + Express.js + TypeScript              |
| Database   | Neon PostgreSQL + Prisma ORM                   |
| Auth       | JWT + bcrypt                                   |
| Deployment | Frontend → Vercel, Backend → Render            |

---

## Architecture

```
drive project/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Route-level pages (admin, seller, buyer)
│       ├── context/       # AuthContext (JWT state)
│       ├── services/      # Axios API clients
│       ├── types/         # TypeScript interfaces
│       ├── routes/        # ProtectedRoute HOC
│       └── lib/           # Utilities (formatters, converters)
│
└── backend/           # Express REST API
    └── src/
        ├── controllers/   # Route handlers
        ├── middleware/     # Auth, error handlers
        ├── routes/        # Express router definitions
        ├── services/      # Conversion logic
        └── lib/           # Prisma client singleton
```

---

## Database Schema

```
User        → id, name, email, passwordHash, role (ADMIN|SELLER|BUYER)
Product     → id, name, sku, baseUnit (WEIGHT|VOLUME|COUNT), inventoryQuantity, pricePerBaseUnit, sellerId
Quotation   → id, buyerId, productId, enteredQuantity, enteredUnit, convertedQuantityBase, calculatedAmount, status
Order       → id, buyerId, productId, quotationId, totalAmount, status (PENDING|APPROVED|REJECTED|COMPLETED)
AuditLog    → id, userId, action, resource, resourceId, metadata
```

All monetary and quantity fields use `Decimal(20,6)` — never float.

---

## API Documentation

### Auth
| Method | Endpoint             | Access  | Description        |
|--------|----------------------|---------|--------------------|
| POST   | /api/auth/register   | Public  | Register new user  |
| POST   | /api/auth/login      | Public  | Login + get JWT    |
| GET    | /api/auth/profile    | Any     | Get own profile    |
| PUT    | /api/auth/profile    | Any     | Update profile     |

### Products
| Method | Endpoint             | Access         | Description         |
|--------|----------------------|----------------|---------------------|
| GET    | /api/products        | Any auth       | List + search       |
| GET    | /api/products/:id    | Any auth       | Get product         |
| POST   | /api/products        | Admin, Seller  | Create product      |
| PUT    | /api/products/:id    | Admin, Seller  | Update product      |
| DELETE | /api/products/:id    | Admin, Seller  | Soft delete         |

### Quotations
| Method | Endpoint                   | Access  | Description              |
|--------|----------------------------|---------|--------------------------|
| GET    | /api/quotations            | Any     | List quotations          |
| POST   | /api/quotations            | Buyer   | Create quotation         |
| PATCH  | /api/quotations/:id        | Any     | Update quotation         |
| POST   | /api/quotations/:id/convert| Buyer   | Convert to order         |

### Orders
| Method | Endpoint                     | Access  | Description         |
|--------|------------------------------|---------|---------------------|
| GET    | /api/orders                  | Any     | List orders         |
| POST   | /api/orders                  | Buyer   | Create order        |
| PATCH  | /api/orders/:id/status       | Admin   | Update order status |

### Admin
| Method | Endpoint              | Access | Description          |
|--------|-----------------------|--------|----------------------|
| GET    | /api/admin/users      | Admin  | List all users       |
| PATCH  | /api/admin/users/:id  | Admin  | Update user status   |
| GET    | /api/admin/analytics  | Admin  | Platform analytics   |
| GET    | /api/admin/inventory  | Admin  | Inventory overview   |

---

## Authentication Flow

1. User submits email + password to `/api/auth/login`
2. Server validates credentials via bcrypt.compare()
3. Server signs JWT with `{ id }` payload and `JWT_SECRET`
4. Client stores token in `localStorage`
5. Subsequent requests include `Authorization: Bearer <token>`
6. `authenticateUser` middleware verifies token and attaches `req.user`
7. `authorizeRoles(...roles)` middleware checks `req.user.role`

---

## Unit Conversion Strategy

All values are stored in **base units** in the database.

| Type   | Base Unit | Supported Units |
|--------|-----------|-----------------|
| Weight | gram (g)  | g, kg           |
| Volume | mL        | mL, L           |
| Count  | item      | item            |

**Examples:**
- User enters 2 kg → stored as 2000 g
- User enters 1.5 L → stored as 1500 mL
- Price per base unit × converted quantity = total price

**Frontend conversion** happens live in the UI (quotation form preview) using `lib/utils.ts`.

**Backend validation** recalculates on every quotation/order creation.

---

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## Setup Instructions

### 1. Clone & install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 2. Configure environment

```bash
# Copy and edit backend env
cp backend/.env.example backend/.env
# Fill in DATABASE_URL from Neon dashboard and JWT_SECRET
```

### 3. Push schema & seed database

```bash
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Start development servers

```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## Test Credentials

| Role   | Email               | Password    |
|--------|---------------------|-------------|
| Admin  | admin@aasa.com      | Admin@123   |
| Seller | seller1@aasa.com    | Seller@123  |
| Seller | seller2@aasa.com    | Seller@123  |
| Buyer  | buyer1@aasa.com     | Buyer@123   |
| Buyer  | buyer2@aasa.com     | Buyer@123   |

---

## Deployment Guide

### Frontend → Vercel

1. Push `frontend/` to a GitHub repo
2. Import in Vercel → set root directory to `frontend`
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Backend → Render

1. Push `backend/` to a GitHub repo  
2. Create a new **Web Service** in Render
3. Build command: `npm install && npm run build && npm run db:generate`
4. Start command: `node dist/index.js`
5. Add environment variables from `.env`
6. Deploy

### Database → Neon PostgreSQL

1. Create project at neon.tech
2. Copy the connection string to `DATABASE_URL`
3. Run `npm run db:push && npm run db:seed` once

---

## Role-Based Access Control

| Feature              | Admin | Seller | Buyer |
|----------------------|-------|--------|-------|
| View all users       | ✅    | ❌     | ❌    |
| Manage all products  | ✅    | Own ✅ | ❌    |
| View all orders      | ✅    | Own ✅ | Own ✅|
| Update order status  | ✅    | ❌     | ❌    |
| Create quotations    | ❌    | ❌     | ✅    |
| Convert to order     | ❌    | ❌     | ✅    |
| View analytics       | ✅    | ❌     | ❌    |
