# City Cat Rescue Website

Next.js app with:

- public landing page
- protected admin panel (email magic-link + allowlisted emails)
- Supabase-backed contact submissions
- folder-style photo section management

## Features

- Public route: `/`
- Login route: `/login`
- Admin routes:
  - `/admin`
  - `/admin/contacts`
  - `/admin/photos`
- API routes:
  - `POST /api/contact`
  - `POST /api/auth/magic-link`
  - `POST /api/auth/signout`
  - `GET /api/admin/contacts`
  - `GET/POST/PATCH/DELETE /api/admin/photos`

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWLIST` (comma-separated emails, e.g. Roman + your email)

4. Run Supabase SQL schema:

- Execute [`supabase/schema.sql`](supabase/schema.sql) in Supabase SQL editor.

5. In Supabase Auth, configure your site URL and redirect URL:

- Site URL: your deployed domain (or `http://localhost:3000` for local)
- Redirect URL must include: `http://localhost:3000/auth/callback` (and production equivalent)

6. Start development server:

```bash
npm run dev
```

## Photo Folder Convention

Folder-like sections are stored via database + storage:

- `photo_folders.slug` behaves like folder name
- images are uploaded to storage bucket `photo-sections`
- storage path format: `<folder-slug>/<image-name>-<unique>.ext`
- public homepage renders all folders where `is_public = true`

## Build Validation

```bash
npm run lint
npm run build
```
