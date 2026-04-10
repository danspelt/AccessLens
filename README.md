# AccessLens

**Accessibility Intelligence for Cities**

A community-driven accessibility platform where people upload photos, accessibility data, and experiences about real-world public places — starting with **Victoria, BC**.

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

### 5. Seed Victoria BC places (50 real locations)

```bash
npx tsx scripts/seedVictoria.ts
```

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
| `/cities/victoria-bc` | Victoria city page with category browsing |
| `/cities/victoria-bc/[category]` | Category listing (e.g. libraries, parks) |
| `/qr` | QR entry hub (pilot location anchors) |
| `/qr/[locationSlug]` | Nearby places for a scanned QR anchor (e.g. `downtown-victoria`) |
| `/add-place` | Add a new place (authenticated) |
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

## Legal

Built in alignment with the **Accessible Canada Act** and the **BC Accessibility Act**. This platform helps communities track, document, and improve real-world accessibility.

## Roadmap

- [ ] AI-powered accessibility detection from photos
- [ ] Street-view scanning integration
- [ ] Vancouver expansion
- [ ] Government compliance reporting dashboard
- [ ] Native mobile app (iOS / Android)
- [ ] S3/MinIO photo storage
- [x] OAuth (Google sign-in via Auth.js)
- [ ] Apple sign-in
