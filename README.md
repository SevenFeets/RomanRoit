# Roman Roit

This repository now tracks `website/` as a regular folder (not a git submodule), so cloning works in one step.

## Clone

```bash
git clone https://github.com/SevenFeets/RomanRoit.git
cd RomanRoit/website
```

## Requirements

- Node.js 20+ (recommended)
- npm 10+
- Supabase project (Auth + Database + Storage)

## First-time setup

```bash
npm install
cp .env.example .env.local
```

Set these in `website/.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ALLOWLIST`

Then run SQL in Supabase:

- execute `website/supabase/schema.sql`

Configure Supabase Auth redirect URLs:

- `http://localhost:3000/auth/callback`
- production callback URL for your deployed domain

## Run

```bash
npm run dev
```
