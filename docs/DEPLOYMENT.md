# Deployment

## Where things live

| Piece | Location |
| --- | --- |
| Code | GitHub `cdobrez/project-lighthouse`, branch `gigkitchens-site` (production branch) |
| Hosting | Vercel project `gigkitchens` (team "Chris Dobrez"), auto-deploys on every push to `gigkitchens-site` |
| Live URL | https://gigkitchens-chris-dobrez.vercel.app (and gigkitchens.com once DNS points at Vercel) |
| Domains on the project | `gigkitchens.com` (primary), `www.gigkitchens.com` (308 redirect to apex) |
| Env vars on Vercel | `SESSION_SECRET` (sensitive), `SITE_URL=https://gigkitchens.com` |

## DNS for gigkitchens.com (GoDaddy)

The domain's nameservers are GoDaddy's (`ns35/ns36.domaincontrol.com`). In GoDaddy → My Products → gigkitchens.com → DNS, set:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `216.198.79.1` | 600 |
| A | `@` | `64.29.17.1` | 600 |
| CNAME | `www` | `5a4f5024d336b514.vercel-dns-017.com` | 600 |

Delete the existing `@` A records (`76.223.105.230`, `13.248.243.5`, GoDaddy's parking/website-builder IPs) and any existing `www` record. Vercel issues the TLS certificate automatically once the records resolve, usually within an hour.

## Persistent database (one-time, about three clicks)

Until a database is attached the site runs on an in-memory copy of the seed data: browsing, demo logins and demo orders work, but real sign-ups and orders disappear when an instance recycles.

1. Open the Vercel project → **Storage** tab → **Create Database** → choose **Turso** (free plan, no card).
2. Connect it to the `gigkitchens` project for Production and Preview.
3. Redeploy (Deployments → ⋯ → Redeploy). The integration injects `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`; the app runs its migrations and seeds the demo data on the first request.

Any other libSQL/Turso database works too: set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` instead.

## Checking on it

- Build and runtime logs: Vercel project → Deployments / Logs.
- A `[gigkitchens] No database configured` warning in the runtime logs means the Turso variables are missing.
- Run `npm run test:e2e` locally against `npm run dev` after changes.
