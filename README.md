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
| Email        | Resend                                    |
| SEO          | Static + per-page meta · Organization / WebSite / FAQPage / ProfessionalService JSON-LD · sitemap.xml · robots.txt with AEO crawlers |
