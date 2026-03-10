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
| Auth | iron-session + bcryptjs |
| Maps | Leaflet + OpenStreetMap |
| Uploads | Local filesystem (`/public/uploads`) → swap for S3/MinIO |
| Validation | Zod |

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
# Edit .env.local with your MongoDB URI and session secret
```

### 4. Initialize database indexes

```bash
npx tsx scripts/initIndexes.ts
```

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
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/health` | Health check (DB ping) |

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

## Legal

Built in alignment with the **Accessible Canada Act** and the **BC Accessibility Act**. This platform helps communities track, document, and improve real-world accessibility.

## Roadmap

- [ ] AI-powered accessibility detection from photos
- [ ] Street-view scanning integration
- [ ] Vancouver expansion
- [ ] Government compliance reporting dashboard
- [ ] Native mobile app (iOS / Android)
- [ ] S3/MinIO photo storage
- [ ] OAuth (Google, Apple)
