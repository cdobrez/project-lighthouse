# Gig Kitchens

Home-cooked meals from your neighbors. Busy households order real dinners from vetted home cooks a few streets away, then pick up on the porch, get a porch drop-off, or have it delivered. Cooks earn extra income from their own kitchen, neighbors rate recipes, and the street gets a little closer.

## What's in the app

| Area | Routes | Notes |
| --- | --- | --- |
| Home | `/` | Hero, how it works, tonight's meals, cooks, photo stories, community pulse |
| Browse | `/meals`, `/meals/[slug]` | Search, neighborhood / day / hand-off / cuisine / diet filters, sorting, meal detail with ratings and order panel |
| Cooks | `/cooks`, `/cooks/[slug]` | Cook directory and public kitchen pages |
| Ordering | `/cart`, `/checkout`, `/orders`, `/orders/[id]` | One-cook basket (localStorage), pickup / drop-off / delivery, tips, demo payment, status timeline, cancel, rate after delivery |
| Accounts | `/signup`, `/login`, `/account` | Email + password, signed cookie sessions, profile, favorites |
| Cooks | `/become-a-cook`, `/cook`, `/cook/meals`, `/cook/meals/new`, `/cook/meals/[id]/edit`, `/cook/profile` | Onboarding with earnings calculator, order queue with status actions, menu management, pause/resume |
| Community | `/community`, `/community/[id]`, `/neighborhoods`, `/neighborhoods/[slug]` | Stories, requests, recipe tips, events; replies and reactions; neighborhood hubs |
| Growth | waitlist form on `/neighborhoods` and `/contact`, `/admin` | Capture demand in new areas; owner dashboard with GMV, platform revenue, issues and kitchens |
| Static | `/how-it-works`, `/about`, `/safety`, `/faq`, `/contact`, `/terms`, `/privacy` | |

## Stack

- Next.js 16 (App Router, Server Actions, Turbopack) + React 19 + TypeScript
- Tailwind CSS v4 with a warm custom palette (`src/app/globals.css`)
- SQLite-compatible libSQL via `@libsql/client` + Drizzle ORM (`src/lib/db`). Local dev uses a file; production uses a hosted Turso database. Migrations are generated into `drizzle/` and bundled into the server (`src/lib/db/migrations.ts`) so they run on any host.
- Sessions: HS256 JWT in an httpOnly cookie (`jose`), scrypt password hashing
- Validation with `zod`

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

The database is created and seeded on first request at `data/gigkitchens.db` (six cooks, sixteen meals, reviews, community posts).

Demo accounts (password `neighbor123`):

- Neighbor: `demo@gigkitchens.com`
- Cook: `rosa@example.com` (also priya@, marcus@, linh@, hannah@, tomas@example.com)
- Owner / admin: `owner@gigkitchens.com` (opens `/admin`: revenue, orders, reported problems, waitlist, pause a kitchen)

## Configuration

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | Required in production. Any long random string. |
| `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` | Hosted database for production (the Turso integration on Vercel sets these automatically). |
| `DATABASE_URL` (+ `DATABASE_AUTH_TOKEN`) | Any libSQL URL: `libsql://…`, `file:./data/gigkitchens.db`, or `:memory:`. Used when the Turso variables are absent. |
| `SITE_URL` | Canonical URL for metadata (default `https://gigkitchens.com`). |

With no database variables set, the app uses `./data/gigkitchens.db` when the disk is writable, otherwise an in-memory database that reseeds on every cold start (fine for previews, not for real orders).

## Deploying

**Vercel (gigkitchens.com).** The repo is linked to the Vercel project `gigkitchens`; every push to the `gigkitchens-site` branch deploys to production. For persistent data, add the free Turso integration from the Vercel Marketplace (Storage tab of the project → Create Database → Turso); it injects `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` and the app migrates and seeds itself on first request. Until then the site runs on an in-memory database.

**Docker / any Node host.** `docker build -t gigkitchens .` then run with a volume on `/app/data` (SQLite file) or with the Turso variables.

## Photos

All photography lives in `public/images` and is registered in `src/lib/images.ts`. See `docs/PHOTOS.md` for the list and how to add more.

## Testing

`npm run test:e2e` drives a real browser through sign-up, basket, checkout, cook order handling, meal creation, rating, and the community board against a running server (`npm run dev` or `npm start`). It needs Chromium: either `npx playwright install chromium` once, or set `CHROME_PATH` to an existing Chrome binary.

## Scripts

```bash
npm run dev      # develop
npm run build    # production build
npm run start    # serve the build
npm run lint     # eslint
npx drizzle-kit generate   # after changing the schema
```

## Roadmap ideas

- Real payments (Stripe Connect so cooks get paid out directly)
- Photo uploads for cooks
- Push / SMS order updates
- Neighbor courier matching for delivery
- Map-based discovery and distance filters
- Weekly subscriptions ("Rosa, every Wednesday")
