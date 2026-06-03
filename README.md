# Aasa Inventory Management Platform

A full-stack, production-ready inventory management system built for AasaMedChem as a recruitment assignment. It supports role-based access for Admins, Sellers, and Buyers with a complete quotation-to-order workflow, unit conversion system, and real-time analytics dashboards.

**Live Demo:**
- Frontend: https://aasamedchem-inventory-system.vercel.app
- Backend API: https://aasamedchem-inventory-system.onrender.com

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Database Schema](#database-schema)
4. [How It Works — Key Features](#how-it-works--key-features)
5. [Unit Conversion System](#unit-conversion-system)
6. [Authentication & Authorization](#authentication--authorization)
7. [Role-Based Access Control](#role-based-access-control)
8. [API Reference](#api-reference)
9. [Dashboards](#dashboards)
10. [Environment Variables](#environment-variables)
11. [Local Setup](#local-setup)
12. [Deployment](#deployment)
13. [Test Credentials](#test-credentials)

---

## Tech Stack

| Layer      | Technology                                         |
|------------|----------------------------------------------------|
| Frontend   | React 18 + Vite + TypeScript + Tailwind CSS v3     |
| State      | TanStack Query (React Query) + React Router v6     |
| Backend    | Node.js + Express.js + TypeScript                  |
| Database   | Neon PostgreSQL (serverless) + Prisma ORM          |
| Auth       | JWT (jsonwebtoken) + bcryptjs                      |
| Deployment | Frontend → Vercel, Backend → Render                |

### Why these choices?
- **Neon PostgreSQL** — serverless, scales to zero, free tier, native PostgreSQL with connection pooling
- **Prisma ORM** — type-safe queries, auto-generated client, easy migrations with `prisma migrate`
- **Decimal(20,6)** — all quantity and monetary fields use `NUMERIC(20,6)` in PostgreSQL, never JavaScript floats, to avoid floating-point precision loss
- **TanStack Query** — automatic caching, background refetching, loading/error states without boilerplate
- **Vite** — fast HMR (Hot Module Replacement) during development, optimized production builds

---

## Project Structure

```
drive project/
├── README.md
│
├── frontend/                        # React + Vite SPA
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx      # Role-aware navigation sidebar
│   │   │   │   └── DashboardLayout.tsx
│   │   │   └── ui/                  # Reusable UI components
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Input.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Table.tsx
│   │   │       ├── Badge.tsx
│   │   │       └── Select.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # JWT storage, login/logout, user state
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx      # Public homepage
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.tsx    # Analytics, top products, recent orders
│   │   │   │   ├── AdminQuotations.tsx   # Unit conversion breakdown table
│   │   │   │   ├── AdminOrders.tsx
│   │   │   │   └── AdminUsers.tsx
│   │   │   ├── seller/
│   │   │   │   ├── SellerDashboard.tsx
│   │   │   │   └── SellerOrders.tsx
│   │   │   ├── buyer/
│   │   │   │   ├── BuyerDashboard.tsx
│   │   │   │   ├── BuyerProducts.tsx     # Multi-product cart + quotation submit
│   │   │   │   ├── BuyerQuotations.tsx
│   │   │   │   └── BuyerOrders.tsx
│   │   │   └── shared/
│   │   │       └── ProductsPage.tsx      # Shared product table with category filter
│   │   ├── routes/
│   │   │   └── ProtectedRoute.tsx   # Redirects unauthenticated users
│   │   ├── services/
│   │   │   └── api.ts               # Axios client with JWT interceptor
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces (User, Product, Quotation, Order)
│   │   ├── lib/
│   │   │   └── utils.ts             # toBaseUnit(), formatCurrency(), getUnitsForBaseType()
│   │   ├── App.tsx                  # Route definitions
│   │   └── main.tsx
│   ├── vercel.json                  # SPA rewrite rule for React Router
│   └── vite.config.ts
│
└── backend/                         # Express REST API
    ├── prisma/
    │   ├── schema.prisma            # Database models
    │   └── seed.ts                  # Seed admin/seller/buyer accounts + products
    └── src/
        ├── controllers/
        │   ├── auth.controller.ts
        │   ├── product.controller.ts
        │   ├── quotation.controller.ts
        │   ├── order.controller.ts
        │   └── admin.controller.ts
        ├── middleware/
        │   ├── auth.middleware.ts   # authenticateUser, authorizeRoles
        │   └── error.middleware.ts
        ├── routes/
        │   ├── auth.routes.ts
        │   ├── product.routes.ts
        │   ├── quotation.routes.ts
        │   ├── order.routes.ts
        │   └── admin.routes.ts
        ├── services/
        │   └── conversion.service.ts  # toBaseUnit(), calculatePrice()
        ├── lib/
        │   └── prisma.ts            # PrismaClient singleton
        └── index.ts                 # Express app, CORS, routes
```

---

## Database Schema

```
User
  id              String  (UUID)
  name            String
  email           String  (unique)
  passwordHash    String
  role            Enum    (ADMIN | SELLER | BUYER)
  isActive        Boolean
  createdAt       DateTime

Product
  id                  String
  name                String
  sku                 String  (unique)
  description         String?
  category            String
  baseUnit            Enum    (WEIGHT | VOLUME | COUNT)
  inventoryQuantity   Decimal(20,6)   ← always in base unit (g / mL / item)
  pricePerBaseUnit    Decimal(20,6)   ← price per 1 gram / 1 mL / 1 item
  lowStockThreshold   Decimal(20,6)
  sellerId            String  (FK → User)

Quotation
  id                      String
  buyerId                 String  (FK → User)
  productId               String  (FK → Product)
  enteredQuantity         Decimal(20,6)   ← what buyer typed (e.g. 2)
  enteredUnit             String          ← what unit buyer selected (e.g. "kg")
  convertedQuantityBase   Decimal(20,6)   ← converted to base (e.g. 2000 g)
  calculatedAmount        Decimal(20,6)   ← convertedQuantityBase × pricePerBaseUnit
  status                  Enum    (PENDING | APPROVED | REJECTED)
  createdAt               DateTime

Order
  id              String
  buyerId         String  (FK → User)
  productId       String  (FK → Product)
  quotationId     String? (FK → Quotation, if converted from quotation)
  enteredQuantity Decimal(20,6)
  enteredUnit     String
  totalAmount     Decimal(20,6)
  status          Enum    (PENDING | APPROVED | REJECTED | COMPLETED)
  createdAt       DateTime

AuditLog
  id          String
  userId      String
  action      String      (e.g. "ORDER_STATUS_UPDATED")
  resource    String      (e.g. "Order")
  resourceId  String
  metadata    Json?       (old status, new status, etc.)
  createdAt   DateTime
```

> All `Decimal(20,6)` fields map to PostgreSQL `NUMERIC(20,6)` — this guarantees exact decimal arithmetic with no floating-point rounding errors.

---

## How It Works — Key Features

### 1. Multi-Product Quotation Cart
Buyers can browse the product catalogue, add multiple products to a cart with chosen quantities and units, preview the live price before submitting, and submit all quotations at once. Under the hood, the frontend calls `Promise.all()` to POST one quotation per product simultaneously.

### 2. Quotation-to-Order Conversion
Once an Admin approves a quotation, the buyer can convert it into a confirmed order with a single click. The order inherits the exact quantities and price from the quotation.

### 3. Admin Unit Conversion View
The Admin Quotations page shows a dedicated "Ordered → Stored As" column alongside a full price breakdown (entered qty × unit → base qty → price calculation). A detail modal shows the complete math for each quotation.

### 4. Category Filter
Products can be filtered by category on both the buyer browse page and the admin/seller product management page. Categories are dynamically fetched from the database.

### 5. Audit Logging
Every order status change is written to the `AuditLog` table with the user ID, action, and before/after state in JSON metadata.

### 6. Low Stock Alerts
Products are flagged "Low stock" in the UI when `inventoryQuantity ≤ lowStockThreshold`.

---

## Unit Conversion System

This is the core technical feature of the platform.

### The Rule
**Always store in base units. Never store in display units.**

| Base Type | Base Unit | User-Facing Units |
|-----------|-----------|-------------------|
| WEIGHT    | gram (g)  | g, kg             |
| VOLUME    | mL        | mL, L             |
| COUNT     | item      | item              |

### Conversion Factors
| From | To   | Factor  |
|------|------|---------|
| kg   | g    | × 1000  |
| g    | g    | × 1     |
| L    | mL   | × 1000  |
| mL   | mL   | × 1     |
| item | item | × 1     |

### Example
A buyer enters **2.5 kg** of a product priced at **₹0.05 per gram**:

```
enteredQuantity      = 2.5
enteredUnit          = "kg"
convertedQuantityBase = 2.5 × 1000 = 2500 g
calculatedAmount     = 2500 × 0.05 = ₹125.00
```

### Where conversion happens
- **Frontend** (`lib/utils.ts` → `toBaseUnit()`): live preview in the cart before submitting
- **Backend** (`services/conversion.service.ts` → `toBaseUnit()`, `calculatePrice()`): recalculates on every quotation/order creation — the frontend value is never trusted blindly

### Why Decimal(20,6) and not float?
JavaScript's `number` type (IEEE 754 double) has precision loss: `0.1 + 0.2 = 0.30000000000000004`. For financial amounts this is unacceptable. PostgreSQL's `NUMERIC(20,6)` stores exact decimal values. Prisma returns these as strings which are parsed with `parseFloat()` only for display, never for storage.

---

## Authentication & Authorization

### Flow
```
1. POST /api/auth/login  { email, password }
2. Server: bcrypt.compare(password, passwordHash)
3. Server: jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" })
4. Client: stores token in localStorage
5. Client: sends  Authorization: Bearer <token>  on every request
6. Middleware: jwt.verify(token) → attaches req.user
7. Middleware: authorizeRoles("ADMIN") → checks req.user.role
```

### Middleware
```typescript
// authenticateUser — verifies JWT, attaches req.user
// authorizeRoles(...roles) — checks role, returns 403 if not allowed

router.get("/admin/users", authenticateUser, authorizeRoles("ADMIN"), getUsers);
router.post("/quotations", authenticateUser, authorizeRoles("BUYER"), createQuotation);
```

### Frontend Route Protection
`ProtectedRoute` wraps every dashboard route. If no valid token is found in `AuthContext`, the user is redirected to `/login`. Role-based redirects happen at `/dashboard` — Admins go to `/admin`, Sellers to `/seller`, Buyers to `/buyer`.

---

## Role-Based Access Control

| Feature                    | Admin | Seller       | Buyer        |
|----------------------------|-------|--------------|--------------|
| View all users             | ✅    | ❌           | ❌           |
| Deactivate users           | ✅    | ❌           | ❌           |
| Create/Edit/Delete products| ✅    | Own only ✅  | ❌           |
| View products              | ✅    | ✅           | ✅           |
| Category filter            | ✅    | ✅           | ✅           |
| Create quotations          | ❌    | ❌           | ✅           |
| View quotations            | All ✅| Own ✅       | Own ✅       |
| Approve/Reject quotations  | ✅    | ❌           | ❌           |
| Convert quotation to order | ❌    | ❌           | ✅           |
| View orders                | All ✅| Own ✅       | Own ✅       |
| Update order status        | ✅    | ❌           | ❌           |
| View analytics dashboard   | ✅    | ❌           | ❌           |
| View revenue dashboard     | ❌    | ✅           | ❌           |

---

## API Reference

### Auth
| Method | Endpoint           | Auth     | Description       |
|--------|--------------------|----------|-------------------|
| POST   | /api/auth/register | Public   | Register new user |
| POST   | /api/auth/login    | Public   | Login, get JWT    |
| GET    | /api/auth/profile  | Any role | Get own profile   |
| PUT    | /api/auth/profile  | Any role | Update profile    |

### Products
| Method | Endpoint                    | Auth           | Description              |
|--------|-----------------------------|----------------|--------------------------|
| GET    | /api/products               | Any auth       | List with search/filter  |
| GET    | /api/products/categories    | Any auth       | List all categories      |
| GET    | /api/products/:id           | Any auth       | Get single product       |
| POST   | /api/products               | Admin, Seller  | Create product           |
| PUT    | /api/products/:id           | Admin, Seller  | Update product           |
| DELETE | /api/products/:id           | Admin, Seller  | Delete product           |

### Quotations
| Method | Endpoint                      | Auth   | Description           |
|--------|-------------------------------|--------|-----------------------|
| GET    | /api/quotations               | Any    | List quotations       |
| POST   | /api/quotations               | Buyer  | Create quotation      |
| PATCH  | /api/quotations/:id           | Any    | Update status         |
| POST   | /api/quotations/:id/convert   | Buyer  | Convert to order      |

### Orders
| Method | Endpoint                      | Auth   | Description           |
|--------|-------------------------------|--------|-----------------------|
| GET    | /api/orders                   | Any    | List orders           |
| POST   | /api/orders                   | Buyer  | Create order          |
| PATCH  | /api/orders/:id/status        | Admin  | Update order status   |

### Admin
| Method | Endpoint                  | Auth  | Description           |
|--------|---------------------------|-------|-----------------------|
| GET    | /api/admin/users          | Admin | List all users        |
| PATCH  | /api/admin/users/:id      | Admin | Update user role/status|
| GET    | /api/admin/analytics      | Admin | Platform analytics    |
| GET    | /api/admin/inventory      | Admin | Inventory overview    |

---

## Dashboards

### Admin Dashboard
- Total users, products, orders, quotations (stat cards)
- Orders by status with progress bars
- Top 5 products by revenue with rank badges
- Recent orders table

### Seller Dashboard
- Own products, total stock, revenue, pending orders
- Revenue chart by product
- Recent orders for own products

### Buyer Dashboard
- Total orders, quotations, pending orders, total spent
- Recent orders list
- Recent quotations list
- "Browse Products" CTA leading to the cart

---

## Environment Variables

### Backend (`backend/.env`)
```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
JWT_SECRET="your-super-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"
PORT=8000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:8000
```

> In production, `VITE_API_URL` is set to the Render backend URL in Vercel's environment settings.

---

## Local Setup

### Prerequisites
- Node.js 18+
- npm 9+
- A Neon PostgreSQL database (free at neon.tech)

### 1. Clone the repository
```bash
git clone https://github.com/shauryaverma03/Aasamedchem-Inventory-System.git
cd Aasamedchem-Inventory-System
```

### 2. Set up the backend
```bash
cd backend
npm install

# Create .env and fill in DATABASE_URL and JWT_SECRET
cp .env.example .env

# Push schema to database
npm run db:generate
npm run db:push

# Seed with test data (admin, sellers, buyers, products)
npm run db:seed

# Start development server
npm run dev
# → Running on http://localhost:8000
```

### 3. Set up the frontend
```bash
cd frontend
npm install

# Create .env
echo "VITE_API_URL=http://localhost:8000" > .env

# Start development server
npm run dev
# → Running on http://localhost:5173
```

---

## Deployment

### Database — Neon PostgreSQL
1. Create a project at [neon.tech](https://neon.tech)
2. Copy the connection string (includes `?sslmode=require`)
3. Paste into `DATABASE_URL` in backend `.env`
4. Run `npm run db:push && npm run db:seed`

### Backend — Render
1. Push repo to GitHub
2. Create a new **Web Service** on Render
3. Set **Root Directory** to `backend`
4. **Build Command:** `npm install --include=dev && npm run db:generate && npm run build`
5. **Start Command:** `node dist/index.js`
6. Add all environment variables from `backend/.env`
7. Deploy

> **Important:** Render sets `NODE_ENV=production` which causes npm to skip devDependencies. The build command forces `--include=dev` to ensure TypeScript and Prisma CLI are available during the build step.

### Frontend — Vercel
1. Import the repository in [Vercel](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. **Framework Preset:** Vite
4. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
5. Deploy

> `vercel.json` includes a rewrite rule `{ "source": "/(.*)", "destination": "/" }` so React Router handles all client-side routes without 404s on refresh.

---

## Test Credentials

| Role   | Email             | Password   |
|--------|-------------------|------------|
| Admin  | admin@aasa.com    | Admin@123  |
| Seller | seller1@aasa.com  | Seller@123 |
| Seller | seller2@aasa.com  | Seller@123 |
| Buyer  | buyer1@aasa.com   | Buyer@123  |
| Buyer  | buyer2@aasa.com   | Buyer@123  |

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| `Decimal(20,6)` for all quantities/prices | Avoids IEEE 754 floating-point errors in financial calculations |
| Store only base units in DB | Single source of truth — no unit ambiguity, no conversion needed on read path |
| Backend recalculates all conversions | Frontend value is never trusted; server always recomputes from entered qty + unit |
| JWT in localStorage | Simple for an SPA; for production, HttpOnly cookies would be more secure |
| Promise.all() for multi-product quotation | Submits all cart items simultaneously instead of sequentially |
| Dynamic CORS for Vercel | Allows any `*.vercel.app` subdomain so preview deployments also work |
| `@types/*` in dependencies not devDependencies | Render's production npm install skips devDependencies, breaking TypeScript build |

---

## Author

Built by **Shaurya Verma** as a recruitment assignment for AasaMedChem.

GitHub: [shauryaverma03](https://github.com/shauryaverma03)
