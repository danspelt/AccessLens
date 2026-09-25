# Project Status — AccessLens

**Last updated:** September 25, 2026
**Status:** Live; application checks pass; production-readiness sign-off still needs operator and accessibility review
**Live:** https://www.accesslens.ca (apex `accesslens.ca` also serves)
**Deploy:** Coolify → `main` branch, Dockerfile build pack — `running:healthy`
**Health:** `GET /api/health` → 200, database connected (verified 2026-09-25)

---

## Where We Are

- Next.js 16, React, Tailwind, MongoDB, Auth.js v5, Leaflet/OpenStreetMap, Zod
- Accessibility checklist + scoring, Places/Reviews/Reports APIs, photo uploads, maps, admin moderation, badges, followed-place notifications
- Public dataset: **48 active Victoria records** and Vancouver seed data; see [Victoria Accessibility Snapshot](VICTORIA_ACCESSIBILITY_SNAPSHOT.md)
- Upload path is now configurable via `UPLOAD_ROOT`; the default is `<app>/public/uploads`, so a persistent volume mounted at `/app/public/uploads` is the simplest Coolify setup
- Sponsor prospectus drafted for review; no outreach has been sent

## What Needs To Get Done

- [ ] In Coolify, mount a persistent, backed-up volume at `/app/public/uploads` and confirm the container user can write there. If using a path outside `public/uploads`, configure a serving/proxy for `/uploads` as documented in README
- [ ] Confirm production `AUTH_URL=https://accesslens.ca` and `NEXT_PUBLIC_APP_URL=https://accesslens.ca` in Coolify. The local production-env check failed because local config is missing these values; that does not verify Coolify settings
- [ ] Run the manual WCAG 2.2 AA review: focus order, zoom/reflow, contrast, screen reader, touch targets, reduced motion
- [ ] Review/approve `SPONSOR_PROSPECTUS_DRAFT.md` before distribution; confirm contact address and final offer terms
- [ ] Refresh the sample snapshot from the live endpoint before external use; dataset values are community-reported, not independent inspections
- Later/product-gated: Stripe billing (only when a business asks to pay), enhanced business profiles, AI photo analysis, Apple sign-in, street-view scanning, native mobile

## Verification

```bash
npm run test        # 29 Vitest tests pass
npm run lint        # passes with one existing <img> optimization warning
npm run typecheck   # passes
npm run build       # passes; local build logs MongoDB connection-refused warnings
npm run test:e2e    # needs build + seeded Mongo
```

## Remaining Risks

- Persistent upload storage and production Auth.js URL values cannot be verified from the public health endpoint; check them in Coolify without exposing secrets
- The local `checkEnvironment.ts` run did not pass: required `AUTH_URL` is absent and production `NEXT_PUBLIC_APP_URL` is not HTTPS
- Full build succeeds, but this local environment cannot connect to MongoDB at the configured address; avoid treating that as a production database check
