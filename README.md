# AccessLens

**Accessibility Intelligence for Cities**

AccessLens is a community-driven accessibility platform for documenting the real-world accessibility
of places like libraries, parks, sidewalks, restaurants, movie theatres, transit stops, hospitals,
shopping centres, and public buildings.

This version launches with **Victoria, BC** as the first city experience and provides:

- a city landing page
- category directories
- place detail pages with accessibility scoring
- checklist-based place submissions
- community reviews
- local evidence photo uploads

## Current Stack

- **Frontend / App**: Next.js 16 App Router, React, TypeScript, Tailwind CSS
- **Backend**: Route Handlers + server components
- **Data**: MongoDB for persisted submissions
- **Auth**: `iron-session` + `bcryptjs`
- **Uploads**: Local `/public/uploads` storage for MVP evidence photos
- **Deployment**: Docker + standalone Next.js build

> Note: the public experience includes Victoria seed data fallback so the app still renders useful
> content before a MongoDB instance is configured.

## MVP Features

- **Landing page** for AccessLens mission and launch status
- **City page** for Victoria, BC (`/victoria-bc`)
- **Category pages** like `/victoria-bc/libraries`
- **Place pages** like `/victoria-bc/libraries/victoria-public-library-central-branch`
- **Accessibility score** based on checklist items
- **Community reviews** with notes and evidence photos
- **Protected contributor flows** for adding places and uploading accessibility evidence
- **Search and filters** from the `/explore` directory

## Data Model

### Users

- `id`
- `name`
- `email`
- `role`
- `created_at`

### Places

- `id`
- `slug`
- `name`
- `category`
- `address`
- `city`
- `citySlug`
- `province`
- `country`
- `accessibilityChecklist`
- `accessibilityNotes`
- `accessibilityScore`
- `accessibilityStatus`
- `photoUrls`
- `latitude`
- `longitude`

### Reviews

- `id`
- `placeId`
- `userId`
- `rating`
- `headline`
- `comment`
- `accessibilityNotes`
- `photoUrls`

## Route Map

### Public

- `/` — landing page
- `/explore` — searchable directory
- `/victoria-bc` — city page
- `/victoria-bc/[category]` — category page
- `/victoria-bc/[category]/[placeSlug]` — place page
- `/login`
- `/signup`

### Protected

- `/dashboard`
- `/add-place`
- `/upload`

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- MongoDB (optional for full submission/auth flows)

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Recommended variables:

- `MONGODB_URI` — MongoDB connection string
- `MONGODB_DB` — database name
- `SESSION_SECRET` — secure random string, minimum 32 characters
- `SESSION_COOKIE_NAME` — session cookie name
- `NEXT_PUBLIC_APP_URL` — app base URL

Optional:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `JWT_SECRET`

### 3) Create indexes

If you are using MongoDB, initialize indexes:

```bash
npx tsx scripts/initIndexes.ts
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Upload Workflow

The MVP supports authenticated local evidence uploads:

- contributors upload image files through `/add-place`, `/upload`, or the review form
- files are stored under `public/uploads/evidence`
- the app stores resulting URLs on places and reviews

This is intentionally simple for local development and can later be swapped for S3 or MinIO.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Build Verification

The current repository has been verified with:

```bash
npm run lint
npm run build
```

## Project Structure

```text
src/
├── app/
│   ├── (protected)/
│   ├── (public)/
│   ├── [citySlug]/
│   └── api/
├── components/
│   ├── layout/
│   ├── places/
│   ├── reviews/
│   └── ui/
├── lib/
│   ├── accesslens/
│   ├── auth/
│   ├── db/
│   └── validation/
└── models/
```

## Next Implementation Steps

- replace local uploads with S3 or MinIO
- add moderation workflows for reports, photos, and spam
- introduce city expansion tooling for Vancouver and beyond
- connect a real map provider (Mapbox or Google Maps)
- add admin seeding tools for the first 100 Victoria places

## License

MIT

