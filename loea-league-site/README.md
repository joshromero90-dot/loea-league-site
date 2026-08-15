# The League of Extraordinary Assholes

The league hub: polls, manager notes, a trade discussion board, curated
links/resources, an auto-updating NFL news feed, league rules, a Hall of
Fame, and live ESPN standings.

Built with Next.js (App Router) + Supabase (auth & database), deployed on
Netlify.

**Start here → [SETUP.md](./SETUP.md)** for step-by-step deployment
instructions (Supabase project, Netlify, your domain, and connecting ESPN).

## Local development

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase values
npm run dev
```

## Project structure

- `src/app/*` — pages (one folder per section: polls, notes, trade-board,
  resources, news, rules, history, standings)
- `src/components/*` — shared UI and interactive forms
- `src/lib/supabase/*` — Supabase client setup (browser, server, middleware)
- `src/lib/espn.ts` — ESPN Fantasy Football standings integration
- `supabase/schema.sql` — full database schema + security rules; run this
  once in your Supabase project's SQL editor
