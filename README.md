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
| Email        | Resend (`STUDIOS_CHECKMATE_RESEND_API_KEY`)                                    |
| SEO          | Static + per-page meta · Organization / WebSite / FAQPage / ProfessionalService JSON-LD · sitemap.xml · robots.txt with AEO crawlers |

## Project layout

```
checkmate-studios/
├── public/                         # favicon, robots, sitemap, webmanifest
├── src/
│   ├── App.tsx                     # composition root + routing
│   ├── forms/                      # Formik forms (Newsletter, Contact, CareerApplication)
│   ├── lib/                        # api client · supabase client · seo hook · toast
│   └── schemas/forms.ts            # Yup schemas (mirror server validators)
├── supabase/
│   ├── schema.sql                  # paste into Supabase SQL Editor
│   ├── config.toml                 # function settings (verify_jwt = false)
│   └── functions/
│       ├── _shared/                # cors · supabase · resend · validators · respond · templates
│       ├── newsletter-subscribe/
│       ├── contact-submit/
│       └── career-apply/
└── index.html                      # SEO/GEO/AEO meta + JSON-LD
```

## 1. Provision Supabase

1. Open the SQL Editor in your Supabase project and run [`supabase/schema.sql`](./supabase/schema.sql). It creates the three tables (with RLS), the `resumes` Storage bucket, and the `updated_at` trigger.
2. Grab your project's **anon** key (Settings → API). The **service-role** key is auto-injected into Edge Functions in production — you only need it locally.

## 2. Set environment variables

Copy `.env.example` → `.env`:

```bash
VITE_SUPABASE_URL="https://vqsdynkbxvxdsshvrklo.supabase.co"
VITE_SUPABASE_ANON_KEY="…"
```

Edge Function secrets (Resend + sender) are **not** read from `.env` in production — set them once with the Supabase CLI:

```bash
supabase secrets set \
  STUDIOS_CHECKMATE_RESEND_API_KEY=re_xxx \
  EMAIL_USER=hello@studiocheckmate.com \
  ADMIN_EMAIL_USER=admin@studiocheckmate.com
```

For local function development, put the same keys in `supabase/.env.functions` (already in `.gitignore`).

## 3. Run locally

```bash
npm install
npm run dev                 # frontend on http://localhost:3000
npm run fn:serve            # Edge Functions on http://localhost:54321/functions/v1/*
```

## 4. Deploy

```bash
supabase link --project-ref vqsdynkbxvxdsshvrklo
supabase db push                    # apply schema.sql migrations
npm run fn:deploy                   # deploy newsletter-subscribe, contact-submit, career-apply
```

The Vite app is a static SPA — deploy `npm run build`'s `dist/` to Vercel, Netlify, Cloudflare Pages, or any static host. The forms call Supabase Edge Functions directly, so the host doesn't need its own API.

## API surface

| Endpoint                                  | Method | Body                                   | Effect                                                                                  |
| ----------------------------------------- | ------ | -------------------------------------- | --------------------------------------------------------------------------------------- |
| `/functions/v1/newsletter-subscribe`      | POST   | `{ email, firstName?, source? }`       | Inserts/reactivates subscriber · sends welcome email                                    |
| `/functions/v1/contact-submit`            | POST   | `{ name, email, service?, budget?, projectDetails?, source? }` | Saves inquiry · sends confirmation to user + notification to admin               |
| `/functions/v1/career-apply`              | POST   | multipart: `jobId, jobTitle, fullName, email, portfolioUrl?, coverLetter?, resume` | Uploads resume to `resumes` bucket · saves application · emails applicant + admin (with attachment) |

Every response is `{ success, message, data?, errors? }`. Validation failures return HTTP 400 with field-level errors that Formik surfaces on the matching inputs.

## SEO / GEO / AEO checklist

- ✅ Per-page `<title>` + `<meta description>` via [`usePageSeo`](./src/lib/seo.ts).
- ✅ Canonical URLs, Open Graph, Twitter cards, theme-color.
- ✅ `geo.region` / `geo.position` / `ICBM` meta for Lagos, NG.
- ✅ JSON-LD: `Organization`, `WebSite` (with sitelinks SearchAction), `ProfessionalService`, `FAQPage`.
- ✅ `robots.txt` allows `GPTBot`, `ChatGPT-User`, `OAI-SearchBot`, `Google-Extended`, `PerplexityBot`, `Applebot-Extended`, `ClaudeBot`, `anthropic-ai` for AEO discoverability.
- ✅ `sitemap.xml` for the four canonical routes (`/`, `/resources`, `/playground`, `/careers`).
- ✅ Web App Manifest with `theme_color: #FF6321`.

Recommended next steps: add per-route OG images (Cloudinary), generate a static `dist/sitemap.xml` from a route table, and pre-render the four routes with `vite-plugin-prerender` or a Vercel ISR setup so crawlers get static HTML.
