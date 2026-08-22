# AccessLens

**Accessibility Intelligence for Cities**

A community-driven accessibility platform where people upload photos, accessibility data, and experiences about real-world public places — live in **Victoria** and **Vancouver**, BC.

> Think: Google Maps + Yelp + Accessibility Data

## What It Does

AccessLens helps people with disabilities navigate cities by providing:

- **Accessibility scores** (0–100) for every place
- **Photo evidence** of entrances, ramps, washrooms, and doors
- **Detailed checklists**: ramps, automatic doors, elevators, accessible washrooms, parking, braille signage, service animal policies, and more
- **Community reviews** with star ratings
- **Live issue reports**: broken elevators, blocked ramps, construction barriers
- **Interactive map** (colour-coded by accessibility: green/yellow/red)

## Categories

Libraries · Restaurants · Movie Theatres · Parks · Government Buildings · Transit Stops · Sidewalks · Shopping · Hospitals · Schools · Sports & Recreation

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React 18, Tailwind CSS |
| Backend | Next.js API Routes (App Router) |
| Database | MongoDB (native driver) |
| Auth | Auth.js (NextAuth v5) — Google, email magic link, credentials |
| Maps | Leaflet + OpenStreetMap |
| Uploads | Local filesystem (`/public/uploads`) → swap for S3/MinIO |
| Validation | Zod |

## Authentication & account types

At signup, users pick **community reviewer** (free) or **business**. Reviewers can submit **reviews** and **accessibility issue reports**; **business** accounts are meant to **add and manage places** and cannot submit that community feedback (enforced in API routes and the UI). Business accounts use a placeholder subscription flag: **`businessSubscriptionStatus: pending`** until billing (e.g. Stripe) is wired to set **`active`**.

## Geocoding (address → coordinates)

AccessLens uses **Nominatim (OpenStreetMap)** via the server route `GET /api/geocode`.  
To be a good citizen and avoid throttling, we:

- **Cache results in MongoDB** (`geocode_cache`) with a TTL index
- Apply a **best-effort per-IP rate limit** (and caching avoids most calls)
- Send a valid **User-Agent** (configure via `NOMINATIM_USER_AGENT`)

Optional env var:
- `NOMINATIM_USER_AGENT` — e.g. `AccessLens (contact: you@example.com)`

## Getting Started

### Local City of Victoria parking candidates

`npm run import:victoria-parking` performs a dry run against a bounded query of five active,
accessible-designated parking-space records from the City of Victoria Open Data API. Add `-- --write`
to replace `data/victoria-accessible-parking.candidates.json`. The importer never connects to MongoDB.

The output is candidate data, not published or community-verified place data. Keep the included City
attribution and provenance, and do not treat the source as a guarantee of current accessibility. Before
publishing a candidate, a community or moderation flow should confirm current signage, dimensions,
route conditions, availability, and parking rules.

Source: [City parking-space layer](https://maps.victoria.ca/server/rest/services/OpenData/OpenData_Parking/MapServer/6).
Licence: [Open Government Licence — City of Victoria](https://opendata.victoria.ca/pages/open-data-licence).

### 1. Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)

### 2. Install

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.local.example .env.local
# Edit .env.local — see below for required values
```

Required variables:
- `MONGODB_URI` / `MONGODB_DB` — your MongoDB connection
- `AUTH_SECRET` — generate with `openssl rand -base64 32`
- `BUSINESS_SESSION_SECRET` — 32+ chars for business QR access sessions (iron-session)

For local Docker Mongo (`docker-compose.mongo.dev.yml`):

```bash
docker compose -f docker-compose.mongo.dev.yml up -d
# MONGODB_URI=mongodb://root:devpassword@localhost:27017/accesslens?authSource=admin
```

Scripts do not auto-load `.env.local`. Prefer:

```bash
node --env-file=.env.local --import tsx scripts/seedCities.ts
```

Optional (enable extra sign-in methods):
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — [Google Cloud Console](https://console.cloud.google.com/apis/credentials) OAuth 2.0 credentials (Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`)
- `RESEND_API_KEY` / `RESEND_FROM_EMAIL` — enables "Email me a sign-in link" magic-link flow

### 4. Initialize database indexes

```bash
npx tsx scripts/initIndexes.ts
```

This creates required indexes, including a **`location` 2dsphere** index used by **`GET /api/places/nearby`** and **`/qr/[locationSlug]`** (nearby listings).

**Places missing GeoJSON `location`?** If older rows only have `latitude` / `longitude`, backfill without re-seeding:

```bash
npx tsx scripts/backfillPlaceLocations.ts
```

`scripts/seedVictoria.ts` now writes `location` on insert; run the backfill once if you seeded before that change.

### 5. Seed data (run in this order)

```bash
# Cities the app is live in (drives /cities/[citySlug] and city lookups)
npx tsx scripts/seedCities.ts

# Editable landing-page content blocks (hero, features, values, etc.)
npx tsx scripts/seedContent.ts
# Use --force to overwrite existing blocks with the defaults
npx tsx scripts/seedContent.ts --force

# Real accessibility data for Victoria, BC (~50 places)
npx tsx scripts/seedVictoria.ts

# High-confidence civic/transit locations for Vancouver, BC (~15 places)
npx tsx scripts/seedVancouver.ts

# Optional: award badges for existing contribution history
npx tsx scripts/backfillBadges.ts
```

Seed scripts are **idempotent**: re-running only upserts missing documents. `seedContent.ts` never overwrites edits made through the admin API unless `--force` is passed.

### 5a. Admin API (edit without re-seeding)

Requires a user with `role: 'admin'` on the `users` collection.

- `GET/PUT /api/admin/site-content/[key]` — edit any `home.*` content block
- `GET/POST /api/admin/cities` — list / upsert cities

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/explore` | Browse all places with map + filters |
| `/places/[id]` | Place detail: checklist, score, photos, reviews, map |
| `/cities/[citySlug]` | City page with category browsing (e.g. `victoria-bc`, `vancouver-bc`) |
| `/cities/[citySlug]/[category]` | Category listing (e.g. libraries, parks) |
| `/admin` | Admin moderation hub (admin role) |
| `/qr` | QR entry hub (pilot location anchors) |
| `/qr/[locationSlug]` | Nearby places for a scanned QR anchor (e.g. `downtown-victoria`) |
| `/places/new` | Submit a new place (authenticated) |
| `/places/[id]/report` | Report an accessibility issue |
| `/dashboard` | User dashboard (authenticated) |

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/api/places` | List places (with filters) |
| POST | `/api/places` | Create a place (auth required) |
| GET | `/api/places/[id]` | Get place detail + stats |
| PATCH | `/api/places/[id]` | Update a place (auth required) |
| GET | `/api/places/[id]/reviews` | Get reviews for a place |
| POST | `/api/places/[id]/reviews` | Submit a review (auth required) |
| POST | `/api/reports` | Submit an accessibility issue (auth required) |
| POST | `/api/upload` | Upload photos (auth required) |
| POST | `/api/auth/signup` | Create account (credentials; includes `accountType`) |
| POST | `/api/auth/complete-signup-intent` | After Google OAuth, set reviewer vs business from signup intent |
| `*` | `/api/auth/[...nextauth]` | Auth.js sign-in / sign-out / callbacks |
| GET | `/api/badges` | Badge progress for the signed-in user |
| GET | `/api/health` | Health check (DB ping) |
| GET | `/api/places/nearby` | Places near `lat` / `lon` (requires `location` + 2dsphere index) |

## Accessibility Score

Each place gets a score from **0–100** based on its accessibility checklist:

- **70–100**: Green — Highly Accessible
- **40–69**: Yellow — Partially Accessible
- **0–39**: Red — Accessibility Barriers

The score is calculated from 10 key criteria: entrance ramp, automatic door, level entrance, elevator, wide aisles, accessible washroom, accessible parking, transit access, braille signage, and service animal policy.

## Deployment

The app includes a production-ready `Dockerfile` (3-stage build: deps → builder → runner).

```bash
docker build -t accesslens .
docker run -p 3000:3000 --env-file .env.local accesslens
```

Deploy to [Coolify](https://coolify.io), Railway, Fly.io, or any Docker host.

### Coolify / reverse proxy (Auth.js)

If logs show **`UntrustedHost`**, the app trusts the proxy **`Host`** by default so Coolify preview URLs (e.g. `*.sslip.io`) work. Set **`AUTH_URL`** in Coolify to your **public** base URL (`https://…`) so redirects and OAuth callbacks match what browsers use, and add `…/api/auth/callback/google` in Google OAuth **Authorized redirect URIs**. Set **`AUTH_TRUST_HOST=false`** only if you rely on a single fixed `AUTH_URL` and want to disallow other hosts.

If logs show **`MissingSecret`**, define **`AUTH_SECRET`** (32+ random characters) in Coolify. With the included **`Dockerfile`**, that variable must be available **during the Docker image build** (middleware is compiled on the Edge runtime and reads the secret at build time). In Coolify, enable the option to pass the variable at **build time** as well as at runtime (e.g. “Available at Buildtime” / build arguments), or set the same `AUTH_SECRET` in both build and runtime environment sections.

### Launch readiness gate

Run configuration validation without printing secrets or connecting to production services:

```bash
NODE_ENV=production node --env-file=.env.local --import tsx scripts/checkEnvironment.ts
```

Before launch, all of the following must be true:

- `MONGODB_URI`, `MONGODB_DB`, `AUTH_SECRET` (32+ characters), `BUSINESS_SESSION_SECRET` (32+ characters), `AUTH_URL`, and `NEXT_PUBLIC_APP_URL` are configured; production URLs use HTTPS.
- `GET /api/health` returns HTTP 200 with `database: connected`. It returns 503 when MongoDB is unavailable so an unhealthy instance does not receive traffic.
- `/app/public/uploads` is mounted to private, persistent, backed-up storage, or the local upload implementation is replaced with object storage. Container-local files are otherwise lost on redeploy.
- The reverse proxy overwrites untrusted `Host` headers when `AUTH_TRUST_HOST` is enabled.
- An administrator has tested sign-up, sign-in, sign-out, password reset/magic link if enabled, Google OAuth if enabled, authorization boundaries, upload/rejection/moderation, and account deletion/data-request procedures.
- Manual WCAG 2.2 AA review covers keyboard focus order and unobscured focus, 200%/400% zoom and reflow, contrast in every state, screen-reader announcements, map/list equivalence, mobile touch targets, validation errors, and reduced motion.

The health endpoint intentionally returns a generic database warning; inspect private server logs for diagnostic details rather than exposing connection errors to users.

## Legal

Built in alignment with the **Accessible Canada Act** and the **BC Accessibility Act**. This platform helps communities track, document, and improve real-world accessibility.

## Tests

```bash
npm test           # Vitest unit tests (scoring, badges, Zod, checklist tags)
npm run test:e2e   # Playwright smoke tests (requires build + Mongo seeded)
```

## Roadmap

- [ ] AI-powered accessibility detection from photos
- [ ] Street-view scanning integration
- [x] Vancouver expansion (civic/transit seed set)
- [x] Admin moderation hub + review verification
- [x] Gamification badges with award + backfill
- [x] Automated test suite (Vitest + Playwright)
- [ ] Government compliance reporting dashboard
- [ ] Native mobile app (iOS / Android)
- [ ] S3/MinIO photo storage
- [x] OAuth (Google sign-in via Auth.js)
- [ ] Apple sign-in
