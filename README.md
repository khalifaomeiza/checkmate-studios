# Checkmate Studios

Premium creative agency website for [studiocheckmate.com](https://www.studiocheckmate.com), built with Vite + React, Tailwind v4, Formik, and a serverless backend on **Supabase Edge Functions** with **Resend** for transactional email.

## Stack

| Layer        | Tech                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| UI           | React 19 · Vite 6 · Tailwind v4 · Motion (Framer) · lucide-react               |
| Forms        | Formik + Yup (mirrors server-side validators)                                  |
| Backend      | Supabase Edge Functions (Deno) — newsletter, contact, careers                  |
| Database     | Supabase Postgres (`newsletter_subscribers`, `contact_submissions`, `career_applications`) |
| File storage | Supabase Storage bucket (`resumes`)                                            |
| Email        | Resend                                                                         |
| SEO          | Static + per-page meta · Organization / WebSite / FAQPage / ProfessionalService JSON-LD · sitemap.xml · robots.txt with AEO crawlers |

## Deployment

### Backend — Supabase

**Option A — Management API (recommended if `db push` fails):**

```bash
# Create token: https://supabase.com/dashboard/account/tokens
# Add SUPABASE_ACCESS_TOKEN=sbp_... to .env
npm run db:push:api
```

**Option B — Direct Postgres (`supabase db push`):**

```bash
supabase login                                     # one-time
supabase link --project-ref vqsdynkbxvxdsshvrklo --password 'YOUR_DB_PASSWORD'   # one-time
# Set the same password in .env as SUPABASE_DB_PASSWORD (see .env.example)
npm run db:push                                    # apply supabase/migrations/*
```

**Option C — Dashboard SQL Editor (no CLI):**

Open [SQL Editor](https://supabase.com/dashboard/project/vqsdynkbxvxdsshvrklo/sql/new), paste the contents of `supabase/dashboard-apply-case-studies.sql`, and click Run.

```bash
npm run fn:secrets    # push R2 + email secrets from .env to Supabase
npm run fn:deploy     # deploy edge functions (upload + delete)
```

### Case studies CMS

Public case studies live at `/works/:slug` (replacing Behance links). Studio editors use:

| Route | Purpose |
| ----- | ------- |
| `/admin/signup` | Invite-only account creation |
| `/admin/login` | Sign in |
| `/admin/works` | List + create case studies |
| `/admin/works/new` | New project editor |
| `/admin/works/edit/:id` | Behance-style section builder (id-based) |
| `/admin/playground` | Playground hero + post list |
| `/admin/playground/new` · `/admin/playground/edit/:id` | Create / edit Playground posts |
| `/admin/careers` | Careers hero, benefits + job listings |
| `/admin/careers/new` · `/admin/careers/edit/:id` | Create / edit open roles |
| `/admin/applications` | Career applications table (from website forms) |

Run end-to-end tests (builds preview server automatically):

```bash
npm run test:e2e
```

Media uploads go through the `case-study-media-upload` Edge Function. **Cloudflare R2** is used when `R2_*` secrets are set (`npm run fn:secrets`); otherwise files land in the public Supabase Storage bucket `case-study-media`. Deleting a case study (`case-study-delete`) removes the database row and all media under `case-studies/{id}/` on R2 plus the `{id}/` folder in Supabase Storage.

After `supabase db push`, create your first editor at `/admin/signup` with the `ADMIN_INVITE_CODE` secret.

### Frontend — Vercel

```bash
npx vercel              # first run: link / create project, then preview deploy
npx vercel --prod       # promote to production
```

Set on Vercel (Project Settings → Environment Variables, all environments):

- `VITE_SUPABASE_URL` = `https://vqsdynkbxvxdsshvrklo.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = the project's anon key

**Supabase keep-alive (Vercel Cron):** Free-tier Supabase projects pause after 7 days without activity. A cron job hits `/api/keep-alive` on days **1, 6, 11, 16, 21, 26** each month (~every 5 days) and pings Auth + Postgres.

No extra env vars required if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are already set — cron auth falls back to the anon key. Optional: set `CRON_SECRET` to override, or `SUPABASE_SERVICE_ROLE_KEY` for a more reliable DB ping.

Manual test after deploy:

```bash
curl -s -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  https://www.studiocheckmate.com/api/keep-alive
```

[`vercel.json`](./vercel.json) wires the framework preset, SPA rewrite, asset cache headers, security headers, and the keep-alive cron. [`.vercelignore`](./.vercelignore) keeps the `supabase/` folder out of the build (it deploys via the Supabase CLI, not Vercel).
