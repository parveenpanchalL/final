# GitHub → Supabase → Vercel Deployment

## 1. GitHub

Create a new GitHub repository and upload the **contents of this folder** (not the ZIP file itself).

Do not upload `.env` or real passwords. `.gitignore` already excludes `.env`, `.env.local`, `node_modules`, `.next`, and `.vercel`.

## 2. Supabase

Create a Supabase project.

Go to **Project Settings → Database → Connection pooling** and copy the **Transaction mode / pooled** connection string (port 6543).

Keep the password private.

## 3. Local database initialization

On a PC with Node.js 20+:

```bash
npm install
```

Create `.env` from `.env.example` and fill in:

```env
DATABASE_URL=your_supabase_pooled_connection
JWT_SECRET=your_long_random_secret
APP_TIMEZONE=Asia/Kolkata
ADMIN_EMAIL=your_hr_email
ADMIN_PASSWORD=your_initial_password_10_chars_minimum
ADMIN_NAME=HR Admin
```

Then run once:

```bash
npm run db:init
```

This creates the database schema and the first HR admin.

## 4. Vercel

Import the GitHub repository into Vercel.

Add the same runtime variables under **Project Settings → Environment Variables**:

- `DATABASE_URL`
- `JWT_SECRET`
- `APP_TIMEZONE`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`

Redeploy after adding/changing variables.

## 5. Open the app

Employee login:

`https://YOUR-DOMAIN.vercel.app/login`

HR login:

`https://YOUR-DOMAIN.vercel.app/admin/login`

The bootstrap HR account is forced to change its password on first login.

## Optional demo data

For a disposable/staging database only:

```bash
CONFIRM_DEMO_SEED=yes npm run db:seed-demo
```

Do not run this against a real production database.

## Important

The repository contains no real `.env` file or installed dependencies. Run `npm install` locally or let Vercel install dependencies during deployment.
