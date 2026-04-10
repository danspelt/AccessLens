# AccessLens — Build Checklist

End-to-end implementation plan, structured for Git feature branches + PRs.

---

## 0. Repo & Branching
- [x] Create `accesslens` repo (GitHub)
- [x] `git init` locally and connect remote
- [x] Branch naming: `feature/<short-name>`

---

## 1. Bootstrap & Core Stack ✅ COMPLETE

- [x] Next.js 16 with TypeScript, Tailwind, ESLint, App Router, `src/` directory
- [x] MongoDB (native driver), iron-session, bcryptjs, Zod, slugify, date-fns
- [x] Leaflet + react-leaflet for maps
- [x] Lucide React icons

---

## 2. Data Models ✅ COMPLETE

### Users
```
_id, email, passwordHash, name, role, badges[], bio, avatarUrl, timestamps
```

### Places
```
_id, name, slug, category, address, city, citySlug, province, country,
description, website, phone, checklist{}, accessibilityScore, accessibilityNotes,
photoUrls[], latitude, longitude, createdByUserId, verifiedAt, timestamps
```

### Categories
```
library | restaurant | movie_theatre | park | government | transit |
sidewalk | shopping | hospital | school | sports | other
```

### Reviews
```
_id, placeId, userId, rating(1-5), comment, photoUrls[], timestamps
```

### Reports
```
_id, placeId, userId, type, description, photoUrls[], status, timestamps
```

---

## 3. Accessibility Checklist ✅ COMPLETE

Per-place boolean flags:
- entranceRamp, automaticDoor, levelEntrance
- elevator, wideAisles, accessibleSeating
- accessibleWashroom, genderNeutralWashroom
- accessibleParking, transitAccessible
- brailleSignage, audioAnnouncements
- serviceAnimalWelcome, quietSpace

---

## 4. Accessibility Score System ✅ COMPLETE

`score = (trueCount / 10 key criteria) × 100`

| Score | Colour | Label |
|---|---|---|
| 70–100 | Green | Highly Accessible |
| 40–69 | Yellow | Partially Accessible |
| 0–39 | Red | Accessibility Barriers |

---

## 5. Auth ✅ COMPLETE

- [x] `POST /api/auth/signup` — bcrypt password hash, iron-session
- [x] `POST /api/auth/login` — verify password, create session
- [x] `POST /api/auth/logout` — destroy session
- [x] Beautiful login + signup pages
- [x] Middleware: protected routes redirect to `/signin`

---

## 6. Places API ✅ COMPLETE

- [x] `GET /api/places` — filters: city, category, accessibility features, search
- [x] `POST /api/places` — auth required; calculates score from checklist
- [x] `GET /api/places/[id]` — with review stats
- [x] `PATCH /api/places/[id]` — update place + recalculate score

---

## 7. Reviews API ✅ COMPLETE

- [x] `GET /api/places/[id]/reviews` — enriched with author names
- [x] `POST /api/places/[id]/reviews` — auth required; Zod validation

---

## 8. Reports API ✅ COMPLETE

- [x] `POST /api/reports` — broken elevator, blocked ramp, construction barrier, etc.
- [x] `GET /api/reports` — filter by placeId, status

---

## 9. Photo Upload ✅ COMPLETE

- [x] `POST /api/upload` — multipart form, stores in `/public/uploads/{context}/`
- [x] `PhotoUpload` component — drag-and-drop, preview, multi-file
- [x] `PhotoGallery` component — lightbox viewer

---

## 10. UI Pages ✅ COMPLETE

| Page | Route | Status |
|---|---|---|
| Landing | `/` | ✅ |
| Explore | `/explore` | ✅ |
| Place Detail | `/places/[id]` | ✅ |
| City | `/cities/victoria-bc` | ✅ |
| Category | `/cities/victoria-bc/[category]` | ✅ |
| Add Place | `/add-place` | ✅ |
| Report Issue | `/places/[id]/report` | ✅ |
| Dashboard | `/dashboard` | ✅ |
| Sign in | `/signin` | ✅ |
| Signup | `/signup` | ✅ |

---

## 11. Map Integration ✅ COMPLETE

- [x] `ExploreMap` — shows all filtered places, colour-coded by score
- [x] `PlaceMap` — single place location with score-coloured marker
- [x] OpenStreetMap tiles (no API key required)
- [x] Custom accessibility score marker icons

---

## 12. UI Components ✅ COMPLETE

- [x] Button (primary, secondary, outline, ghost, danger)
- [x] Card, Badge, Alert
- [x] Input, Textarea, Select, Label
- [x] StarRating (interactive + readonly)
- [x] AccessibilityScore display
- [x] ChecklistItem (yes/no/unknown)
- [x] SkipLink (accessibility)
- [x] Navbar (responsive, mobile menu, server+client split)

---

## 13. Seed Data ✅ COMPLETE

`scripts/seedVictoria.ts` — **50 real places** in Victoria BC:

| Category | Count |
|---|---|
| Restaurants | 7 |
| Government | 6 |
| Parks | 5 |
| Shopping | 5 |
| Transit | 4 |
| Libraries | 3 |
| Hospitals | 3 |
| Sports | 4 |
| Schools | 3 |
| Movie Theatres | 3 |
| Sidewalks | 4 |
| Other | 3 |

---

## 14. Dockerization ✅ COMPLETE

- [x] 3-stage Dockerfile (deps → builder → runner)
- [x] Healthcheck on `/api/health`
- [x] `.dockerignore`

---

## Next Priority Tasks

1. **Run seed data** → `npx tsx scripts/seedVictoria.ts`
2. **Add S3/MinIO** → swap local file uploads for cloud storage
3. **OAuth** → add Google/Apple sign-in via Auth.js
4. **Admin moderation** → review queue for photos and reports
5. **Gamification** → badges: Explorer, Accessibility Hero, City Mapper
6. **AI photo analysis** → detect ramps, doors, barriers from uploaded photos
7. **Vancouver expansion** → replicate for next city

---

## Summary

| Section | Status |
|---|---|
| Bootstrap & Stack | ✅ Complete |
| Data Models | ✅ Complete |
| Accessibility Checklist + Score | ✅ Complete |
| Auth (signup/login/logout) | ✅ Complete |
| Places API | ✅ Complete |
| Reviews API | ✅ Complete |
| Reports API | ✅ Complete |
| Photo Upload | ✅ Complete |
| Maps (Leaflet) | ✅ Complete |
| All UI Pages | ✅ Complete |
| UI Component Library | ✅ Complete |
| Seed Data (50 Victoria places) | ✅ Complete |
| Docker | ✅ Complete |
| Production Release | ⬜ Pending |
