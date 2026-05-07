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

```bash
supabase login                                     # one-time
supabase link --project-ref vqsdynkbxvxdsshvrklo   # one-time
supabase db push                                   # apply supabase/migrations/*
supabase secrets set \
  STUDIOS_CHECKMATE_RESEND_API_KEY=re_xxx \
  EMAIL_USER=hello@studiocheckmate.com \
  ADMIN_EMAIL_USER=admin@studiocheckmate.com
npm run fn:deploy                                  # deploys 3 edge functions
```

### Frontend — Vercel

```bash
npx vercel              # first run: link / create project, then preview deploy
npx vercel --prod       # promote to production
```

Set on Vercel (Project Settings → Environment Variables, all environments):

- `VITE_SUPABASE_URL` = `https://vqsdynkbxvxdsshvrklo.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = the project's anon key

[`vercel.json`](./vercel.json) wires the framework preset, SPA rewrite, asset cache headers, and security headers. [`.vercelignore`](./.vercelignore) keeps the `supabase/` folder out of the build (it deploys via the Supabase CLI, not Vercel).
