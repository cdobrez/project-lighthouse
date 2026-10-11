# Deployment

## Where things live

| Piece | Location |
| --- | --- |
| Code | GitHub `cdobrez/project-lighthouse`, branch `gigkitchens-site` (production branch) |
| Hosting | Vercel project `gigkitchens` (team "Chris Dobrez"), auto-deploys on every push to `gigkitchens-site` |
| Live URL | https://gigkitchens-chris-dobrez.vercel.app (and gigkitchens.com once DNS points at Vercel) |
| Domains on the project | `gigkitchens.com` (primary), `www.gigkitchens.com` (308 redirect to apex) |
| Env vars on Vercel | `SESSION_SECRET`, `CRON_SECRET` (sensitive), `SITE_URL=https://gigkitchens.com`, `BLOB_READ_WRITE_TOKEN` (from the Blob store) |
| Deployment protection | Off (Vercel Authentication was disabled so the vercel.app URL is public) |

## DNS for gigkitchens.com (GoDaddy)

The domain's nameservers are GoDaddy's (`ns35/ns36.domaincontrol.com`). In GoDaddy → My Products → gigkitchens.com → DNS, set:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | 600 |
| A | `@` | `64.29.17.1` | 600 |
| CNAME | `www` | `5a4f5024d336b514.vercel-dns-017.com` | 600 |

Delete the existing `@` A records (`76.223.105.230`, `13.248.243.5`, GoDaddy's parking/website-builder IPs) and any existing `www` record. Vercel issues the TLS certificate automatically once the records resolve, usually within an hour.

## Database

**Today (snapshot mode).** With no database attached, the site keeps its SQLite file in the project's Blob store: encrypted with a key derived from `SESSION_SECRET`, restored on every cold start, and written back after every change (each instance also checks for a newer snapshot every few seconds). Sign-ups, orders, messages and photos persist. The one limit: if two server instances write within the same second, the later upload wins, so this is right for a pilot, not for heavy traffic.

**Recommended upgrade (one-time, about three clicks).** A hosted libSQL database removes that limit entirely and the app switches over automatically when the variables appear:

1. Open the Vercel project → **Storage** tab → **Create Database** → choose **Turso** (free plan, no card).
2. Connect it to the `gigkitchens` project for Production and Preview.
3. Redeploy (Deployments → ⋯ → Redeploy). The integration injects `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; the app runs its migrations and seeds the demo data on the first request. (Data from snapshot mode does not carry over automatically; ask for a migration if you have real orders by then.)

Any other libSQL/Turso database works too: set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` instead.

## Optional integrations (each is a Vercel environment variable)

| Feature | Variables | Where to get them |
| --- | --- | --- |
| Photo uploads | `BLOB_READ_WRITE_TOKEN` | Already set: the `gigkitchens-photos` Blob store is connected to the project. |
| Real payments | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe dashboard → Developers → API keys; then add a webhook endpoint `https://gigkitchens.com/api/stripe/webhook` for `checkout.session.completed` and copy its signing secret. |
| Standing orders cron | `CRON_SECRET` | Already set. Vercel Cron calls `/api/cron/standing-orders` daily at 14:00 UTC (see `vercel.json`). |
| Email | `RESEND_API_KEY`, `EMAIL_FROM` | resend.com → verify the gigkitchens.com domain (two DNS records at GoDaddy) → API key. `EMAIL_FROM` like `Gig Kitchens <orders@gigkitchens.com>`. |

Redeploy after adding variables. Nothing breaks when they are absent: uploads fall back to local disk (or a library photo), checkout runs in demo mode, and emails are logged instead of sent.

## Checking on it

- Build and runtime logs: Vercel project → Deployments / Logs.
- `[gigkitchens] restored database snapshot from …` in the runtime logs means snapshot mode is active; `snapshot save failed` means writes are not persisting and needs attention.
- Run `npm run test:e2e` locally against `npm run dev` after changes.
