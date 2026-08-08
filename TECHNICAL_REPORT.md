# AccessLens Technical Report

**Accessibility Intelligence for Cities**

?

## Executive Summary

AccessLens is a community-driven accessibility platform built with modern web technologies to help people with disabilities navigate cities. The platform combines crowdsourced accessibility data, interactive mapping, and community reviews to create a comprehensive resource for accessibility information.

**Current Status**: Core platform complete with Victoria (~48 places) and Vancouver (~15 high-confidence civic/transit locations). Admin moderation, badge awards, Vitest + Playwright tests, and Docker support are in place.

---

## 1. Architecture Overview

### 1.1 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 (App Router), React 18, TypeScript | Server-side rendering, routing, UI layer |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS framework |
| **Backend** | Next.js API Routes | Serverless API endpoints |
| **Database** | MongoDB 6.x (native driver) | Document-based data storage |
| **Authentication** | Auth.js (NextAuth v5) | Multi-provider authentication |
| **Maps** | Leaflet + OpenStreetMap | Interactive mapping (no API key required) |
| **File Uploads** | Local filesystem (`/public/uploads`) | Photo storage (S3/MinIO ready) |
| **Validation** | Zod 4.x | Runtime type safety |
| **Icons** | Lucide React | Consistent iconography |

### 1.2 Project Structure

```
accesslens/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (protected)/        # Auth-required routes
│   │   ├── (public)/           # Public routes
│   │   ├── api/                # API endpoints
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Landing page
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI primitives
│   │   ├── places/             # Place-related components
│   │   ├── maps/               # Map components
│   │   └── auth/               # Authentication components
│   ├── lib/                    # Utility libraries
│   │   ├── db/                 # Database client & helpers
│   │   ├── auth/               # Auth helpers
│   │   ├── badges/             # Badge evaluation & progress
│   │   └── accessibility/      # Accessibility utilities
│   ├── models/                 # TypeScript type definitions
│   ├── proxy.ts                # Next.js 16 request proxy (auth + redirects)
│   └── auth.ts                 # Auth.js configuration
├── scripts/                    # Database seeding & utilities
├── e2e/                        # Playwright smoke tests
├── public/uploads/             # Local file storage
├── Dockerfile                  # Production container
└── next.config.ts              # Next.js configuration
```

---

## 2. Core Features

### 2.1 Accessibility Scoring System

Each place receives a calculated accessibility score (0-100) based on 10 key criteria:

| Criteria | Weight |
|----------|--------|
| Entrance ramp | 10% |
| Automatic door | 10% |
| Level entrance | 10% |
| Elevator | 10% |
| Wide aisles | 10% |
| Accessible washroom | 10% |
| Accessible parking | 10% |
| Transit accessible | 10% |
| Braille signage | 10% |
| Service animal welcome | 10% |

**Score Interpretation:**
- **70-100 (Green)**: Highly Accessible
- **40-69 (Yellow)**: Partially Accessible  
- **0-39 (Red)**: Accessibility Barriers

### 2.2 Data Models

#### User Model
```typescript
interface User {
  _id: ObjectId;
  email: string;
  passwordHash?: string;
  name: string;
  role: 'user' | 'admin' | 'moderator' | 'student';
  accountType: 'reviewer' | 'business';
  businessSubscriptionStatus: 'none' | 'pending' | 'active';
  badges: UserBadge[];
  bio?: string;
  avatarUrl?: string;
  // Accessibility preferences
  theme?: 'system' | 'light' | 'dark';
  fontScale?: 'sm' | 'md' | 'lg';
  highContrast?: boolean;
  reduceMotion?: boolean;
  dyslexiaFont?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Place Model
```typescript
interface Place {
  _id: ObjectId;
  name: string;
  slug: string;
  category: PlaceCategory;  // 16 categories
  address: string;
  city: string;
  citySlug: string;
  province: string;
  country: string;
  // Accessibility
  checklist: Partial<AccessibilityChecklist>;  // 14 boolean flags
  accessibilityScore?: number;
  accessibilityNotes?: string;
  // Location
  latitude?: number;
  longitude?: number;
  location?: { type: 'Point'; coordinates: [number, number] };  // GeoJSON
  // Media
  photoUrls: string[];
  // Status
  status: 'active' | 'pending_review' | 'rejected' | 'archived';
  source?: {
    type: 'community_submission' | 'business_submission' | 'admin_created' | 'imported';
    submittedByUserId?: ObjectId;
  };
  createdByUserId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 Authentication System

Auth.js (NextAuth v5) provides multiple authentication methods:

| Method | Status | Use Case |
|--------|--------|----------|
| **Google OAuth** | ✅ Active | Quick sign-in, account linking |
| **Email Magic Link** | ✅ Active | Passwordless authentication |
| **Credentials (Email/Password)** | ✅ Active | Traditional sign-in |

**Account Types:**
- **Reviewer** (free): Can submit reviews and accessibility reports
- **Business** (subscription): Can add/manage places, cannot submit community feedback

**Security Features:**
- BCrypt password hashing (salt rounds: 10)
- JWT session management with `iron-session`
- Route-level protection via middleware
- Account type enforcement in API routes

---

## 3. API Architecture

### 3.1 RESTful Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/places` | Public | List places with filters (city, category, score) |
| `POST` | `/api/places` | Required | Create new place |
| `GET` | `/api/places/[id]` | Public | Get place details + stats |
| `PATCH` | `/api/places/[id]` | Required | Update place (recalculates score) |
| `GET` | `/api/places/[id]/reviews` | Public | Get reviews for place |
| `POST` | `/api/places/[id]/reviews` | Required | Submit review (reviewers only) |
| `GET` | `/api/places/nearby` | Public | Places near coordinates (2dsphere index) |
| `POST` | `/api/reports` | Required | Submit accessibility issue |
| `POST` | `/api/upload` | Required | Upload photos |
| `POST` | `/api/auth/signup` | Public | Create account |
| `GET` | `/api/geocode` | Public | Address → coordinates (Nominatim + cache) |
| `GET` | `/api/health` | Public | Health check (DB ping) |

### 3.2 Middleware & Route Protection

```typescript
// middleware.ts - Route access control
const isPublicRoute = pathname === '/' ||
  pathname.startsWith('/signin') ||
  pathname.startsWith('/signup') ||
  pathname.startsWith('/explore') ||
  pathname.startsWith('/places') ||
  pathname.startsWith('/cities') ||
  pathname.startsWith('/api/places') ||
  // ... additional public routes

if (!isPublicRoute && !req.auth) {
  return Response.redirect(new URL('/signin', req.url));
}
```

---

## 4. Database Design

### 4.1 MongoDB Collections

| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `users` | User accounts | `email` (unique), `_id` |
| `places` | Location data | `location` (2dsphere), `citySlug`, `category`, `slug` (unique) |
| `reviews` | User reviews | `placeId`, `userId` |
| `reports` | Issue reports | `placeId`, `status` |
| `geocode_cache` | Geocoding cache | `query` (unique), `createdAt` (TTL) |
| `cities` | Supported cities | `slug` (unique) |
| `siteContent` | CMS content | `key` (unique) |
| `accounts` | OAuth accounts | Auth.js managed |
| `sessions` | User sessions | Auth.js managed |
| `verification_tokens` | Email verification | Auth.js managed |

### 4.2 Geospatial Capabilities

The platform uses MongoDB's 2dsphere index for location-based queries:

```typescript
// Creating the index
await placesCollection.createIndex({ location: '2dsphere' });

// Finding nearby places
await placesCollection.find({
  location: {
    $near: {
      $geometry: { type: 'Point', coordinates: [lng, lat] },
      $maxDistance: radiusInMeters,
    },
  },
});
```

### 4.3 Database Initialization

```bash
# Create indexes
npx tsx scripts/initIndexes.ts

# Backfill GeoJSON from lat/lng (if needed)
npx tsx scripts/backfillPlaceLocations.ts
```

---

## 5. Frontend Architecture

### 5.1 Component Hierarchy

```
layout.tsx (Root)
├── ClientWrapper (Auth + UI providers)
│   ├── Navbar (Responsive navigation)
│   └── Page Content
│       ├── Landing Page (Marketing)
│       ├── Explore (Map + List)
│       ├── Place Detail (Checklist + Reviews)
│       ├── Dashboard (User management)
│       └── Admin (Content management)
```

### 5.2 Key UI Components

| Component | Purpose | Props |
|-----------|---------|-------|
| `ExploreMap` | Interactive map with markers | `places`, `filters`, `onMarkerClick` |
| `PlaceMap` | Single place location | `place`, `zoom` |
| `AccessibilityScore` | Score visualization | `score`, `size`, `showLabel` |
| `ChecklistItem` | Yes/No/Unknown toggle | `label`, `value`, `onChange` |
| `PhotoUpload` | Drag-drop file upload | `onUpload`, `maxFiles`, `context` |
| `PhotoGallery` | Lightbox viewer | `photos`, `placeName` |
| `StarRating` | Interactive/readonly stars | `rating`, `onChange`, `size` |
| `ResponsiveTable` | Data tables | `columns`, `rows`, `keyField` |

### 5.3 Map Integration

**Leaflet Configuration:**
- Tiles: OpenStreetMap (free, no API key)
- Markers: Custom color-coded by accessibility score
- Clustering: Ready for implementation
- Mobile: Touch-optimized controls

**Marker Color Scheme:**
- 🟢 Green: Score ≥ 70
- 🟡 Yellow: Score 40-69
- 🔴 Red: Score < 40

---

## 6. Deployment & DevOps

### 6.1 Docker Configuration

Multi-stage Dockerfile for production:

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
COPY --from=builder /app/.next/standalone ./
EXPOSE 3000
CMD ["node", "server.js"]
```

**Build & Run:**
```bash
docker build -t accesslens .
docker run -p 3000:3000 --env-file .env.local accesslens
```

### 6.2 Environment Variables

**Required:**
```env
MONGODB_URI=mongodb://localhost:27017/accesslens
MONGODB_DB=accesslens
AUTH_SECRET=<openssl rand -base64 32>
```

**Optional (OAuth, Email):**
```env
GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
RESEND_API_KEY=<from Resend>
RESEND_FROM_EMAIL=AccessLens <noreply@example.com>
NOMINATIM_USER_AGENT=AccessLens (contact: you@example.com)
```

### 6.3 Health Monitoring

- **Health Endpoint**: `GET /api/health` - DB connectivity check
- **Build Verification**: TypeScript compilation, ESLint
- **Runtime Monitoring**: Container healthcheck configured

---

## 7. Development Workflow

### 7.1 Setup Commands

```bash
# Installation
npm install

# Development
npm run dev          # Next.js dev server (Turbopack)
npm run dev:webpack  # Webpack alternative

# Build & Quality
npm run build        # Production build
npm run lint         # ESLint
npm run typecheck    # TypeScript check

# Database
npx tsx scripts/initIndexes.ts      # Create indexes
npx tsx scripts/seedCities.ts         # Seed cities
npx tsx scripts/seedContent.ts        # Seed CMS content
npx tsx scripts/seedVictoria.ts       # Seed 50 Victoria places
```

### 7.2 Seed Data Summary

| Script | Purpose | Records |
|--------|---------|---------|
| `seedCities.ts` | Supported cities | 1 (Victoria, BC) |
| `seedContent.ts` | Landing page content | 5 blocks |
| `seedVictoria.ts` | Real accessibility data | 50 places |

**Place Categories in Seed:**
- Restaurants: 7
- Government: 6
- Parks: 5
- Shopping: 5
- Transit: 4
- Libraries: 3
- Hospitals: 3
- Sports: 4
- Schools: 3
- Movie Theatres: 3
- Sidewalks: 4
- Other: 3

---

## 8. Security Considerations

### 8.1 Authentication Security

- Passwords hashed with BCrypt (adaptive hashing)
- Sessions encrypted with `iron-session` (seal/verify pattern)
- OAuth state parameter validation
- CSRF protection via Auth.js

### 8.2 Data Access Control

- API routes validate authentication before database operations
- Account type restrictions enforced (reviewer vs business)
- MongoDB ObjectId validation on all ID parameters
- File uploads restricted by MIME type and size

### 8.3 Deployment Security

- Standalone output (no dev dependencies in production)
- Environment variables isolated from frontend
- Trust proxy configuration for reverse proxies (Coolify, etc.)
- Immutable cache headers for uploaded assets

---

## 9. Performance Optimizations

### 9.1 Database

- **Indexing**: 2dsphere for geospatial, compound for filters
- **Caching**: Geocode results cached with TTL
- **Projections**: Selective field retrieval in queries

### 9.2 Frontend

- **Next.js Image**: Optimized image loading
- **Code Splitting**: Route-based automatic splitting
- **Standalone Output**: Minimal production bundle

### 9.3 Maps

- **Tile Caching**: Browser-cached map tiles
- **Lazy Loading**: Maps load on viewport intersection
- **Marker Clustering**: Ready for high-density areas

---

## 10. Future Roadmap

### 10.1 Planned Features

| Feature | Priority | Status |
|---------|----------|--------|
| AI-powered photo analysis | High | Research |
| Street-view scanning | Medium | Planning |
| Vancouver expansion | High | Ready |
| Government compliance dashboard | Medium | Design |
| Native mobile app | Low | Future |
| S3/MinIO photo storage | Medium | Ready |
| Apple Sign-In | Low | Planned |

### 10.2 Technical Debt

- [ ] Implement comprehensive test suite (unit + e2e)
- [ ] Add API rate limiting beyond geocoding
- [ ] Implement proper CDN for static assets
- [ ] Add database connection pooling optimization
- [ ] Set up production monitoring (Sentry/DataDog)

---

## 11. Compliance & Legal

AccessLens is built in alignment with:
- **Accessible Canada Act** - Federal accessibility standards
- **BC Accessibility Act** - Provincial requirements

The platform itself follows WCAG 2.1 AA guidelines:
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

---

## 12. Conclusion

AccessLens represents a production-ready accessibility platform with:

✅ **Modern Architecture**: Next.js 16, React 18, TypeScript, MongoDB  
✅ **Complete Feature Set**: Scoring, reviews, maps, photos, reporting  
✅ **Multi-modal Auth**: Google, email magic link, credentials  
✅ **Production Ready**: Docker containerization, health checks  
✅ **Real Data**: 50+ verified places in Victoria, BC  
✅ **Extensible**: Clear patterns for new cities and features  

The codebase follows Next.js best practices with clear separation of concerns, type safety throughout, and a component-based architecture that supports future growth.

---

**Repository**: `e:\Git\AccessLens`  
**Version**: 0.1.0  
**Last Updated**: May 2026
