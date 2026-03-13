# xenoCampus

The all-in-one school ecosystem SaaS platform.

---

## Stack

- **Frontend / SaaS Layer** — Next.js 14 (App Router)
- **Backend (Ecosystem)** — Django (existing demo)
- **Database (Main)** — PostgreSQL on Render
- **Database (Per School)** — PostgreSQL on Render (one DB per school)
- **Storage** — Cloudflare R2
- **Payments** — Stripe
- **Hosting** — Vercel (frontend) + Render (backend)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`:
- `DATABASE_URL` — your Render Postgres connection string
- `STRIPE_SECRET_KEY` — from Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` — from Stripe webhook settings
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — from Stripe dashboard
- `STRIPE_STARTER_PRICE_ID`, `STRIPE_GROWTH_PRICE_ID`, `STRIPE_PRO_PRICE_ID` — create these in Stripe
- `JWT_SECRET` — any long random string

### 3. Set up the main database

Run the schema on your Render Postgres instance:

```bash
psql $DATABASE_URL -f lib/sql/main-schema.sql
```

### 4. Run locally

```bash
npm run dev
```

App runs at `http://localhost:3000`

### 5. Set up Stripe webhook (local testing)

Install Stripe CLI then run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This gives you a webhook secret to put in `.env.local`.

---

## Project Structure

```
app/
├── page.tsx                      # Landing page
├── (auth)/
│   ├── signup/page.tsx           # 4-step school onboarding
│   └── login/page.tsx            # School admin login
├── (dashboard)/
│   └── overview/page.tsx         # School dashboard
├── onboarding/success/page.tsx   # Post-payment provisioning screen
├── admin/
│   └── schools/page.tsx          # xenoCampus admin panel
└── api/
    ├── auth/login/route.ts       # Login endpoint
    ├── stripe/
    │   ├── checkout/route.ts     # Creates Stripe checkout session
    │   └── webhook/route.ts      # Handles all Stripe events
    └── provision/
        └── status/route.ts       # Polls provisioning status

lib/
├── db.ts                         # Main DB connection
├── stripe.ts                     # Stripe client + plan config
├── provision.ts                  # School DB provisioning logic
├── auth.ts                       # JWT + password helpers
└── sql/
    └── main-schema.sql           # Main DB schema (run once)

middleware.ts                     # Subdomain routing + auth protection
```

---

## Provisioning Flow

When a school pays:

1. `checkout.session.completed` webhook fires
2. `provisionSchool()` is called with the school ID
3. A new Postgres DB is created (`school_{subdomain}`)
4. Django migrations are run on the new DB via a provisioning endpoint
5. Cloudflare R2 folder is initialised
6. School status → `active`
7. School sees their live ecosystem URL

---

## Environment Notes

- In development, subdomains won't work on localhost. Test the main platform flows first.
- For subdomain testing locally, use something like `lvh.me` (resolves all subdomains to 127.0.0.1) or edit your `/etc/hosts` file.
- In production, set up a wildcard DNS record: `*.xenocampus.com → Vercel`

---

## Next Steps (Phase 2)

- [ ] Connect Django provisioning endpoint (`/api/provision/migrate/`)
- [ ] Cloudflare R2 integration (upload, signed URLs)
- [ ] School branding settings page
- [ ] Subdomain routing to school ecosystem
- [ ] Usage aggregation cron job
- [ ] Transactional emails (welcome, suspension, cancellation)
- [ ] Admin suspend/unsuspend actions
- [ ] Custom domain setup flow (Growth+)
