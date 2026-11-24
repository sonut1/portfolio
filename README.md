# Sanjana Pandey — Journalism & News Reporter Portfolio

Editorial portfolio and full-stack Newsroom CMS built for **Sanjana Pandey** (News Reporter | Journalist | News Anchor).

## Architecture

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4 with Dark/Light editorial theme
- **Motion & Icons**: Framer Motion, Lucide React
- **Database**: Prisma ORM (`prisma/schema.prisma` configured for SQLite locally; `prisma/schema.postgresql.prisma` provided for PostgreSQL / Neon / Supabase)
- **Auth**: HMAC-SHA256 JWT (`jose`) in HttpOnly cookies + Node `crypto.scryptSync` password hashing + Next.js `src/proxy.ts` route protection + API `requireAdmin()` checks
- **Media Storage**: Adapter (`src/lib/storage.ts`) supporting **Cloudinary**, **Supabase Storage**, or local filesystem (`public/uploads/`) — never storing binary media in the database.

## Getting Started

1. Configure environment variables in `.env` (see `.env.example`):
   ```env
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="replace-with-random-secret"
   ADMIN_EMAIL="admin@sanjanapandey.in"
   ADMIN_PASSWORD="ChangeMe@2026!"
   STORAGE_PROVIDER="local"
   ```
2. Sync the database schema and generate the Prisma client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:3000` for the public portfolio, and `http://localhost:3000/admin` to sign in and manage videos, articles, gallery photos, profile details, and resume PDF.

## Production Cloud Setup

- **PostgreSQL**: `prisma/schema.prisma` already uses the `postgresql` provider. Set `DATABASE_URL` to your PostgreSQL connection string (Neon, Supabase, Railway, etc.).
- **Cloudinary**: Set `STORAGE_PROVIDER="cloudinary"` along with `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.
- **Supabase Storage**: Set `STORAGE_PROVIDER="supabase"` along with `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.

## Vercel Deployment

1. Push your code to a GitHub repository.
2. Import the repo in [Vercel](https://vercel.com) (Add New → Project → Import Git Repository).
3. In Vercel Project Settings → Environment Variables, add all variables from `.env.example` (use your production values):
   - `DATABASE_URL` — your PostgreSQL connection string
   - `AUTH_SECRET` — a long random secret (generate with `openssl rand -hex 32`)
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`
   - `NEXT_PUBLIC_SITE_URL` — your Vercel domain (e.g. `https://your-site.vercel.app`)
   - `STORAGE_PROVIDER` — `"cloudinary"` or `"supabase"`
   - Cloudinary or Supabase credentials (depending on provider)
4. Vercel runs `npm run build` automatically (`prisma generate && next build`).
5. After the first deploy, visit `/admin/login` and sign in with your `ADMIN_EMAIL` / `ADMIN_PASSWORD`. The bootstrap step creates the default profile and admin user on first request.

### Important
- Do **not** use `STORAGE_PROVIDER="local"` on Vercel — the filesystem is read-only and uploads will not persist.
- Do **not** commit `.env`. Only `.env.example` is tracked.
- `prisma/dev.db`, `public/uploads/`, and `.next/` are gitignored and will not be deployed.
