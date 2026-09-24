# Project Status — AccessLens

**Last updated:** September 23, 2026
**Status:** Feature-complete; live in production
**Live:** https://www.accesslens.ca (apex `accesslens.ca` also serves)
**Deploy:** Coolify → `main` branch, Dockerfile build pack — `running:healthy`
**Health:** `GET /api/health` → 200 `{"status":"ok","database":"connected"}` (verified 2026-09-23)
**Repo state:** `main` checked out, clean, synced with origin

---

## Where We Are

Every section of `PROJECT_ROADMAP.md` is complete except the final production-release gate:

- Full stack: Next.js 16, React, Tailwind, MongoDB (native driver), Auth.js v5 (Google + magic link + credentials), Leaflet/OpenStreetMap, Zod
- Accessibility checklist + 0–100 score, Places/Reviews/Reports APIs, photo upload, all UI pages, component library
- Seed data live in **Victoria (~50 places)** and **Vancouver (~15 places)**
- Admin moderation hub, gamification badges, followed-place notifications (in-app + optional Resend email)
- Vitest unit tests + Playwright smoke e2e; production Dockerfile
- Recent hardening (2026-09-22): launch-critical security and geocoding paths; legal pages matching real account/follow/email behavior

## Where We Go Next

Business model: **free public resource funded by institutions** — the person needing accessibility info never pays, and payment never affects listing inclusion or score. Stage 1 goal is dataset growth toward ~250 places and landing the first sponsor.

## What Needs To Get Done

- [ ] Set `UPLOAD_ROOT` to persistent, backed-up storage in Coolify and serve `/uploads` from that mount — container-local uploads are lost on redeploy (or swap to S3/MinIO)
- [ ] Run `npm run check:env` with `NODE_ENV=production` against the deployed env and close any gaps
- [ ] Manual WCAG 2.2 AA review per the README launch checklist (focus order, zoom/reflow, contrast, screen reader, touch targets, reduced motion)
- [ ] Sponsor prospectus one-pager for tourism orgs / BIAs / foundations
- [ ] Generate a "Victoria Accessibility Snapshot" sample report from live data
- [ ] Wire Stripe billing → `businessSubscriptionStatus: pending` → `active` (only when a business asks to pay)
- [ ] Enhanced business profile tier (photos, links, verified status, printable QR) — score stays independent
- Later: AI photo analysis, Apple sign-in, street-view scanning, native mobile

## Verification

```bash
npm run test        # Vitest unit tests
npm run lint
npm run typecheck
npm run build
npm run test:e2e    # Playwright — needs build + seeded Mongo
```

## Known Issues

- Photo uploads use the configurable local filesystem (`UPLOAD_ROOT`, default `/public/uploads`) — not durable until production points it at a mounted volume and serves `/uploads` from it
- `businessSubscriptionStatus` remains `pending` for all business accounts until Stripe is wired
- Geocoding depends on Nominatim; cached in MongoDB but still an external dependency
