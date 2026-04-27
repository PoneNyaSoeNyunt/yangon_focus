# Yangon Focus

**Hostel Management Platform for Yangon**

Yangon Focus is a full-stack web application built to streamline hostel discovery, booking, and management across Yangon. The platform serves three distinct user roles — **Guests** (Hostel Seekers), **Owners** (Hostel Operators), and a **Super Admin** — with a strong emphasis on **service reliability** and **data integrity**.

---

## Tech Stack

| Layer        | Technology                                                       |
| ------------ | ---------------------------------------------------------------- |
| **Frontend** | React 19 (Vite 8), Tailwind CSS 4, React Router 7, React Query 5 |
| **Backend**  | Laravel 12 (PHP 8.2), Sanctum (token auth)                      |
| **Database** | MariaDB 10.4 (XAMPP), snake_case schema, FK-constrained          |
| **Storage**  | Local disk (dev) / Cloudinary (production)                       |
| **Tooling**  | Composer 2.8, Node 22, npm 10                                    |

---

## Design Principles

- **Service Reliability** — Incremental brute-force lockout (3 min → 10 min → 30 min → 24 h), centralized `status_codes` table for consistent state management across all entities, and database-backed sessions/cache/queues for crash resilience.
- **Data Integrity** — Foreign-key constraints on every relationship, structured NRC verification with region/township lookups, and transactional writes for bookings and payments.

---

## Prerequisites

| Requirement    | Version      |
| -------------- | ------------ |
| XAMPP           | **8.2.12**   |
| PHP             | **8.2.12**   |
| Composer        | **2.8.x**    |
| Node.js         | **22.x**     |
| npm             | **10.x**     |
| MariaDB         | 10.4+ (bundled with XAMPP) |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/PoneNyaSoeNyunt/yangon_focus.git
cd yangon_focus
```

### 2. Backend setup

```bash
composer install
cp .env.example .env
php artisan key:generate
```

> `key:generate` automatically writes a random `APP_KEY` into your `.env` file. No manual action needed — Laravel uses this key to encrypt sessions, cookies, and other sensitive data. Never share or commit this key.

### 3. Configure the database

Open `.env` and set the database credentials:

```dotenv
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=yangon_focus
DB_USERNAME=root
DB_PASSWORD=
```

Then create the database and run migrations + seeders:

```bash
# In XAMPP, start Apache & MySQL, then via phpMyAdmin or CLI:
mysql -u root -e "CREATE DATABASE IF NOT EXISTS yangon_focus;"

php artisan migrate
php artisan db:seed
```

> **Importing a `.sql` dump instead?**
> If you have a `yangon_focus.sql` export file, import it via phpMyAdmin or CLI:
> ```bash
> mysql -u root yangon_focus < yangon_focus.sql
> ```
> Skip `php artisan migrate` and `db:seed` if the dump already contains all tables and seed data.

### 4. Frontend setup

```bash
cd frontend
npm install
```

### 5. Run the application

From the project root:

```bash
# Terminal 1 — Backend
php artisan serve

# Terminal 2 — Frontend
cd frontend
npm run dev
```

- **Backend API**: `http://localhost:8000/api/v1`
- **Frontend**: `http://localhost:5173`

---

## Core Features

### Authentication & Security
- **Phone-number-based login** — Myanmar phone numbers (`09XXXXXXXXX`) as the primary identifier.
- **Incremental brute-force lockout** — 5 failed attempts trigger escalating lockout penalties (3 min, 10 min, 30 min, 24 h), tracked in the `auth_rate_limits` table.
- **Sanctum token authentication** — Stateless API tokens for the React SPA.

### NRC Verification
- **Structured NRC input** — Region code, township (searchable dropdown from `nrc_townships` table), type (N/P/E/T), and 6-digit number.
- **Data-backed lookups** — All 330+ townships seeded per official Myanmar NRC data.

### Hostel Management (Owner)
- **Inventory hierarchy** — Hostels → Rooms → Beds, each bed tracked with `is_occupied`.
- **Multi-step listing wizard** — Basic Info → Rooms & Beds → License & Gallery.
- **Business license verification** — Admin-reviewed with approve/reject workflow.
- **Subscription gating** — Owners must maintain an active subscription to list properties.

### Bookings & Payments
- **Booking lifecycle** — Pending → Active → Completed / Cancelled, managed via centralized `status_codes`.
- **Payment methods** — Cash (manual entry) and digital screenshots (KBZPay / WaveMoney).
- **Screenshot upload** — Owners and guests can attach payment proof images.

### Admin Dashboard
- **User management** — View, suspend, and activate accounts.
- **License verification** — Approve or reject hostel business licenses.
- **Subscription management** — Monitor owner subscription payments.
- **Misconduct reports** — Categorized reporting system with resolution tracking.
- **Analytics** — Platform-wide statistics and overview.

### Guest Features
- **Hostel discovery** — Browse and search hostels across Yangon townships.
- **Booking management** — View current stays, booking history, and make payments.
- **Reviews** — Rate and review hostels after a stay.

---

## Testing Credentials

After running `php artisan db:seed`, the following account is available:

| Role            | Phone Number     | Password      |
| --------------- | ---------------- | ------------- |
| **Super Admin** | `09765432189`    | `$Admin123`   |

If you imported the `.sql` dump, the following test accounts are also available:

| Role        | Password      |
| ----------- | ------------- |
| **Guest**   | `$Seeker123`  |
| **Owner**   | `$Owner123`   |

> These passwords apply to all pre-seeded Guest and Owner accounts in the `.sql` file. For any new accounts, use the registration wizard at `/register`.

---

## Project Structure

```
yangon-focus/
├── app/
│   ├── Http/Controllers/   # Skinny controllers
│   ├── Models/             # Eloquent models with relationships
│   └── Services/           # Business logic (Service Classes)
├── database/
│   ├── migrations/         # 36 migration files (FK-constrained)
│   └── seeders/            # Status codes, townships, NRC data, admin user
├── routes/
│   └── api.php             # All API routes prefixed with /v1
├── frontend/
│   ├── src/
│   │   ├── pages/          # Route-level React components
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # AuthContext (global auth state)
│   │   ├── services/       # API service modules (axios)
│   │   └── api/            # Axios client configuration
│   └── package.json
├── .env.example
├── composer.json
└── README.md
```

---

## Environment Variables

Key variables in `.env`:

| Variable              | Description                                      | Default                    |
| --------------------- | ------------------------------------------------ | -------------------------- |
| `DB_DATABASE`         | MariaDB database name                            | `laravel`                  |
| `FILESYSTEM_DISK`     | `public` for local dev, `cloudinary` for prod    | `public`                   |
| `CLOUDINARY_URL`      | Cloudinary connection string (production only)    | —                          |
| `VITE_API_BASE_URL`   | API base URL consumed by the React frontend       | `http://localhost:8000/api/v1` |
| `FRONTEND_URL`        | Frontend origin for CORS                          | `http://localhost:5173`    |

---

## License

This project is developed for academic and portfolio purposes by **PoneNyaSoeNyunt**.
