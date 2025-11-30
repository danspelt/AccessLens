# AccessLens – Build Checklist

End-to-end implementation plan, structured for Git feature branches + PRs.

---

## 0. Repo & Branching
- [x] Create `accesslens` repo (GitHub)
- [x] `git init` locally and connect remote
- [x] Create and push branches:
  - [x] `main` (protected, production)
  - [x] `develop` (integration)
- [x] Branch naming: `feature/<short-name>`

---

## 1. Bootstrap Next.js App
**Branch:** `feature/bootstrap` ✅ COMPLETE

- [x] Run `create-next-app` with:
  - [x] TypeScript
  - [x] Tailwind
  - [x] ESLint
  - [x] App Router
  - [x] `src/` directory
- [x] Verify `npm run dev` works
- [x] Commit scaffold
- [x] PR → merge into develop

---

## 2. Install Core Stack Dependencies
**Branch:** `feature/core-deps` ✅ COMPLETE

- [x] Install DB: `mongodb`
- [x] Install auth/session: `bcryptjs`, `jsonwebtoken`, `iron-session`
- [x] Install email: `resend`
- [x] Install UI helpers: `lucide-react`, `clsx`, `tailwind-merge`
- [x] Install validation/utils: `zod`, `slugify`
- [x] Commit `package.json`/lockfile
- [x] PR → merge into develop

---

## 3. Core Infrastructure Layer
**Branch:** `feature/core-infra` ✅ COMPLETE

- [x] Add `src/lib/db/mongoClient.ts`
  - [x] Uses `MONGODB_URI`, `MONGODB_DB`
  - [x] Global singleton in dev
  - [x] `getDb()` helper
- [x] Add `src/lib/auth/session.ts`
  - [x] `getSession`, `createSession`, `destroySession` with iron-session
  - [x] `SESSION_SECRET`, `SESSION_COOKIE_NAME=accesslens_session`
- [x] Add `src/lib/auth/authHelpers.ts`
  - [x] `hashPassword(password)`
  - [x] `verifyPassword(password, hash)`
- [x] Add `src/lib/validation/schemas.ts`:
  - [x] `signupSchema`
  - [x] `loginSchema`
  - [x] `placeSchema` (name, category, address, city, flags)
  - [x] `reviewSchema` (rating, comment, optional photos)
- [x] Add health check route `src/app/api/health/route.ts` using `db.command({ ping: 1 })`
- [x] PR → merge into develop

---

## 4. Domain Model & Index Strategy
**Branch:** `feature/domain-model` ✅ COMPLETE

- [x] Create `src/models/user.ts`, `place.ts`, `review.ts` (TS interfaces)
- [x] Define:
  - [x] `User` with email, passwordHash, name, role, timestamps
  - [x] `Place` with category, address, city, indoor, accessibility flags, timestamps
  - [x] `Review` with placeId, userId, ratingOverall, comment, photoUrls, timestamps
- [x] Add `scripts/initIndexes.ts` to create:
  - [x] `users.email` unique
  - [x] `places.city+category`, future location index
  - [x] `reviews.placeId+createdAt`
- [x] PR → merge into develop

---

## 5. App Routing, Layouts & Middleware
**Branch:** `feature/routing-middleware` ✅ COMPLETE

- [x] Create app structure:
  - [x] `src/app/layout.tsx` – root layout, `<Navbar />`, `<main id="main">`
  - [x] `src/app/(public)/page.tsx` – landing (at `src/app/page.tsx`)
  - [x] `src/app/(public)/explore/page.tsx`
  - [x] `src/app/(public)/places/[id]/page.tsx`
  - [x] `src/app/(public)/login/page.tsx`
  - [x] `src/app/(public)/signup/page.tsx`
  - [x] `src/app/(protected)/layout.tsx`
  - [x] `src/app/(protected)/dashboard/page.tsx`
  - [x] `src/app/(protected)/add-place/page.tsx`
- [x] Add `src/middleware.ts`:
  - [x] Public routes: `/`, `/login`, `/signup`, `/explore`, `/places`, `/api/health`
  - [x] Enforce session cookie on protected routes; redirect to `/login` if absent
- [x] PR → merge into develop

---

## 6. Auth (API + Pages)
**Branch:** `feature/auth` ✅ COMPLETE

- [x] Implement `POST /api/auth/signup`:
  - [x] Validate body with `signupSchema`
  - [x] Check email uniqueness
  - [x] Hash password, insert user
  - [x] Create session, respond with minimal user info
- [x] Implement `POST /api/auth/login`:
  - [x] Validate with `loginSchema`
  - [x] Lookup user by email
  - [x] Verify password
  - [x] Create session
- [x] Implement `POST /api/auth/logout`:
  - [x] Destroy session
- [x] Build `/signup` page:
  - [x] Accessible form with email, password, name
  - [x] On success, redirect `/dashboard`
- [x] Build `/login` page:
  - [x] Accessible email/password form
  - [x] On success, redirect to `/dashboard`
- [x] PR → merge into develop

---

## 7. Places: API + Explore + Detail + Add Place
**Branch:** `feature/places` ✅ COMPLETE

### API
- [x] `GET /api/places`:
  - [x] Query all places (later add filters)
  - [x] Sort by `createdAt` desc
- [x] `POST /api/places` (auth required):
  - [x] Validate body with `placeSchema`
  - [x] Insert in places with `createdByUserId`
  - [x] Return inserted document or ID
- [x] `GET /api/places/[id]`:
  - [x] Lookup place by `_id`
  - [x] Return place plus optional basic stats (avgRating, review count)

### Pages / Components
- [x] Explore page `(public)/explore/page.tsx`:
  - [x] Server component using `getDb()` (no client fetch)
  - [x] Filter bar (category chips, city search)
  - [x] Grid of `<PlaceCard />`
- [x] `PlaceCard` component `components/places/PlaceCard.tsx`:
  - [x] Display name, category, city
  - [x] Show accessibility tags (step-free, washroom, parking)
  - [x] Optional average rating badge
- [x] Add Place page `(protected)/add-place/page.tsx`:
  - [x] Client form mapped to `placeSchema` fields
  - [x] Uses `fetch("/api/places", { method: "POST" })`
  - [x] On success, redirect to `/places/[id]`
- [x] Place Detail page `(public)/places/[id]/page.tsx`:
  - [x] Server component
  - [x] Load place by ID & recent reviews
  - [x] Render accessibility summary and `<ReviewList />`
- [x] PR → merge into develop

---

## 8. Reviews: API + Components
**Branch:** `feature/reviews` ✅ COMPLETE

### API
- [x] `POST /api/places/[id]/reviews` (auth required):
  - [x] Validate body with `reviewSchema`
  - [x] Verify place exists
  - [x] Insert into reviews with `userId`, `placeId`
- [x] `GET /api/places/[id]/reviews`:
  - [x] List latest reviews for that place with author names

### Components
- [x] `ReviewForm` `components/reviews/ReviewForm.tsx`:
  - [x] Props: `placeId`, `userId` (or session user)
  - [x] Rating input (1–5) + comment + photo URL(s)
  - [x] Client-side validation, POST to API
  - [x] On success, refresh page or update state
- [x] `ReviewList` `components/places/ReviewList.tsx`:
  - [x] Props: `reviews`
  - [x] Display author name, rating, comment, optional image, date
- [x] Wire `ReviewForm` and `ReviewList` into `/places/[id]` page:
  - [x] Show form only for authenticated users
  - [x] Show "Log in to leave an accessibility review" CTA for guests
- [x] PR → merge into develop

---

## 9. Dashboard
**Branch:** `feature/dashboard` 
- [x] `/dashboard` (protected):
  - [x] Server component; uses `getSession()` to get `userId`
  - [x] Query places where `createdByUserId = userId`
  - [x] Query reviews where `userId = userId`, join place names in code
- [x] UI sections:
  - [x] "Your contributed places" list with links to `/places/[id]`
  - [x] "Your reviews" list (short) with links to places
- [x] PR → merge into develop

---

## 10. UI System & Accessibility Hardening
**Branch:** `feature/ui-accessibility` ✅ COMPLETE

- [x] `components/ui`:
  - [x] `Button`, `Card`, `Badge` (missing: `Input`, `Textarea`, `Chip`)
  - [x] Tailwind-based, consistent spacing, high contrast
- [x] `components/accessibility/SkipLink.tsx` (at `components/layout/SkipLink.tsx`)
  - [x] "Skip to main content" link, visible on focus
- [x] Update `layout.tsx`:
  - [x] Include `<SkipLink />`
  - [x] `<main id="main">` for target
- [ ] Add meaningful landmarks & headings:
  - [ ] Audit: Only one `h1` per page
  - [ ] Audit: Logical `h2`, `h3` nesting
- [ ] Keyboard / screenreader checks:
  - [ ] Test tab order
  - [ ] Ensure rating control is screenreader-friendly (`aria-label`)
- [ ] Mobile layout review:
  - [ ] Ensure filters & cards are responsive at 375px width
- [ ] PR → merge into develop

---

## 11. Configuration & Env Management
**Branch:** `feature/config-env` ✅ COMPLETE

- [x] Add `.env.local.example` (no secrets):
  ```
  MONGODB_URI=
  MONGODB_DB=
  SESSION_SECRET=
  SESSION_COOKIE_NAME=accesslens_session
  JWT_SECRET=
  RESEND_API_KEY=
  RESEND_FROM_EMAIL=
  NEXT_PUBLIC_APP_URL=
  ```
- [x] Update `.gitignore` to include `.env*`
- [x] Document env variables in `.env.local.example`
- [ ] PR → merge into develop

---

## 12. Dockerization
**Branch:** `feature/docker` ✅ COMPLETE

- [x] Add `Dockerfile`:
  - [x] `deps` stage (`npm ci`)
  - [x] `builder` stage (`npm run build`)
  - [x] `runner` stage (Node 20, `node server.js`)
  - [x] Healthcheck hitting `/api/health`
- [x] Add `.dockerignore`:
  - [x] `node_modules`, `.next`, `.env*`, `.git`, etc.
- [x] Local test:
  - [x] `docker build -t accesslens .`
  - [x] `docker run -p 3000:3000 accesslens`
- [x] PR → merge into develop

---

## 13. Deployment via Coolify
**Branch:** `feature/deployment-docs` ✅ COMPLETE

- [x] Coolify app creation:
  - [x] Repo, branch `main`, build from Dockerfile
  - [x] Env var setup on Coolify
  - [x] Domain & auto-SSL
- [x] After first deploy:
  - [x] Validate `https://accesslens.yourdomain/api/health`
  - [ ] Smoke-test flows: signup, login, add place, add review, explore
- [ ] Document in `README.md` or `DEPLOYMENT.md`
- [ ] PR → merge into develop

---

## 14. First Production Release
**Branch:** N/A (release process)

- [ ] Ensure `develop` is green (build, lint, basic manual QA)
- [ ] `git checkout main`
- [ ] `git merge --no-ff develop`
- [ ] Tag release:
  ```bash
  git tag -a v0.1.0 -m "AccessLens MVP"
  git push origin main --tags
  ```
- [ ] Confirm Coolify deploy
- [ ] Run final smoke tests on production URL

---

## Summary

| Section | Status |
|---------|--------|
| 0. Repo & Branching | ✅ Complete |
| 1. Bootstrap Next.js | ✅ Complete |
| 2. Core Dependencies | ✅ Complete |
| 3. Core Infrastructure | ✅ Complete |
| 4. Domain Model | ✅ Complete |
| 5. Routing & Middleware | ✅ Complete |
| 6. Auth | ✅ Complete |
| 7. Places | ✅ Complete |
| 8. Reviews | ✅ Complete |
| 9. Dashboard | ✅ Complete |
| 10. UI & Accessibility | 🔶 Needs audit |
| 11. Config & Env | ✅ Complete |
| 12. Docker | ✅ Complete |
| 13. Coolify Deployment | 🔶 Needs docs |
| 14. Production Release | ⬜ Pending |

---

## Next Priority Tasks

1. **Accessibility audit** – Heading hierarchy, keyboard nav, ARIA labels
2. **Smoke test all flows** – Signup → Login → Add Place → Add Review → Explore
3. **Tag v0.1.0 release** – After QA passes
