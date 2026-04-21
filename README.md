# School Management System

An open-source, multi-institution school management platform built with **Laravel 11**, **Inertia.js**, **React (TypeScript)**, and **Tailwind CSS**. Each institution gets its own branded workspace — logo, name, and primary color — with fully isolated data.

> Powered by [Execudea](https://execudea.com)

---

## Features

### Institutions & tenancy
- Multi-institution support with per-tenant data isolation
- Self-service institution registration
- Custom branding per institution (name, logo, primary color)
- Role-based access: Super Admin, Institution Admin, Teacher, Student

### Students
- Student profiles, enrollment, and class assignment
- Guardian / parent contact details
- Bulk import (CSV) and individual creation
- Search, filter, and paginate by class, section, or status

### Teachers & Staff
- Teacher profiles with subject and class assignments
- Role and permission management
- Activity-scoped to the teacher's institution

### Classes, Sections & Subjects
- Create classes (grades), sections, and subjects
- Assign teachers to subjects
- Map students to a class + section

### Fees
- Fee structure per class
- Invoice generation
- Payment recording and history
- Outstanding balance tracking

### Accounts
- Financial transaction records
- Basic ledger / reports per institution

### Dashboard
- Quick stats: students, teachers, classes, outstanding fees
- Scoped to the logged-in institution

### Authentication & Security
- Laravel Breeze + Sanctum
- Email verification, password reset
- Session-based auth with CSRF protection
- Per-institution data scoping on every query

### Frontend
- React + TypeScript + Inertia
- Tailwind CSS with the institution's primary color
- Lucide icons, responsive layouts
- SEO-optimized landing page

---

## Tech Stack

| Layer       | Tech                                              |
| ----------- | ------------------------------------------------- |
| Backend     | PHP 8.2+, Laravel 11                              |
| Frontend    | React 18, TypeScript, Inertia.js, Tailwind CSS    |
| Build       | Vite                                              |
| Auth        | Laravel Breeze, Sanctum                           |
| DB          | MySQL / MariaDB (SQLite for local dev)            |
| Routing     | Ziggy (route names shared to JS)                  |

---

## Requirements

- PHP **8.2+** with extensions: `mbstring`, `openssl`, `pdo`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`, `fileinfo`
- Composer 2.x
- Node.js **18+** and npm
- MySQL 5.7+ / MariaDB 10.3+ (or SQLite for quick start)

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/<your-org>/school-management-system.git
cd school-management-system

# 2. PHP deps
composer install

# 3. JS deps
npm install

# 4. Environment
cp .env.example .env
php artisan key:generate

# 5. Configure .env
#    - APP_URL
#    - DB_CONNECTION / DB_DATABASE / DB_USERNAME / DB_PASSWORD
#    - MAIL_* (for password resets + verification emails)

# 6. Database
php artisan migrate --seed

# 7. Storage symlink (for uploaded logos, etc.)
php artisan storage:link

# 8. Run it
composer dev
```

`composer dev` starts the PHP server, queue worker, log tailer, and Vite concurrently. Visit **http://localhost:8000**.

If you prefer separate terminals:

```bash
php artisan serve
npm run dev
```

---

## Default Accounts

After `php artisan migrate --seed`, the following account is created:

| Role         | Email                 | Password     |
| ------------ | --------------------- | ------------ |
| Super Admin  | `admin@example.com`   | `password`   |

> Change the password on first login. Seeders are in `database/seeders/`.

---

## Creating an Institution

1. Go to `/institutions/register` from the landing page.
2. Provide institution name, admin email, and password.
3. Log in → customize branding under **Settings**.
4. Start adding classes, sections, teachers, and students.

---

## Project Structure

```
app/
├── Http/Controllers/      # Controllers (Students, Teachers, Classes, Fees, ...)
├── Models/                # Eloquent models
└── Policies/              # Authorization

resources/
├── js/
│   ├── Pages/             # Inertia React pages
│   ├── Layouts/           # AppLayout, GuestLayout
│   ├── components/        # Shared UI
│   └── lib/               # Helpers
├── css/                   # Tailwind entry
└── views/                 # app.blade.php (Inertia root)

routes/
├── web.php                # Main routes
└── auth.php               # Breeze auth routes

database/
├── migrations/
└── seeders/

public/img/                # Logo, hero image
```

---

## Available Commands

```bash
# Dev
composer dev              # All services concurrently
php artisan serve         # PHP dev server
npm run dev               # Vite dev server
npm run build             # Production JS/CSS build

# DB
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed

# Code quality
./vendor/bin/pint         # PHP formatter
php artisan test          # PHPUnit tests

# Caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize:clear
```

---

## Production Deployment

See **[cPanel deploy guide](#cpanel-deployment)** below or use the standard Laravel deploy flow:

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan storage:link
```

Point your webserver document root to `public/`.

### cPanel deployment

1. Push the repo to GitHub/Bitbucket.
2. cPanel → **Git Version Control** → clone the repo outside `public_html`.
3. Point your domain's document root to `<repo>/public`.
4. SSH in: run `composer install --no-dev`, set `.env`, `php artisan key:generate`, `php artisan migrate --force`, `php artisan storage:link`.
5. Commit `public/build/` (or run `npm run build` on the server if Node is available).
6. Add a `.cpanel.yml` in the repo root for push-to-deploy.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit with clear messages
4. Run `./vendor/bin/pint` and `php artisan test`
5. Open a Pull Request

For bug reports and feature requests, open an [issue](../../issues).

---

## License

Released under the **MIT License**. See [LICENSE](LICENSE) for details.

---

## Credits

- Built on [Laravel](https://laravel.com), [Inertia.js](https://inertiajs.com), and [React](https://react.dev)
- UI with [Tailwind CSS](https://tailwindcss.com) and [Lucide](https://lucide.dev) icons
- Maintained by [Execudea](https://execudea.com)
