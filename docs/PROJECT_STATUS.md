# Project Status — AccessLens

**Last updated:** September 26, 2026
**Status:** Live; launch fixes deployed; operator checks (auth sign-in round-trip, upload persistence across redeploy) and prospectus approval pending
**Live:** https://www.accesslens.ca (canonical; apex `accesslens.ca` 308-redirects to www)
**Deploy:** Coolify → `main` branch, Dockerfile build pack
**Health:** `GET /api/health` → 200, database connected (verified 2026-09-26)

---

## Where We Are

- Next.js 16, React, Tailwind, MongoDB, Auth.js v5, Leaflet/OpenStreetMap, Zod
- Accessibility checklist + scoring, Places/Reviews/Reports APIs, photo uploads, maps, admin moderation, badges, followed-place notifications
- Public legal pages live (`/privacy`, `/terms`, `/cookies`, `/accessibility`) grounded in actual product behavior
- Public dataset: **48 active Victoria records** and Vancouver seed data; see [Victoria Accessibility Snapshot](VICTORIA_ACCESSIBILITY_SNAPSHOT.md) (recomputed from the live API 2026-09-26 — counts unchanged)
- Sponsor prospectus updated (date, snapshot, contact, independence terms); awaiting Dan's approval; no outreach has been sent

## Launch Findings (2026-09-26)

- **Production uploads were broken.** A test upload returned 500: `EACCES: permission denied, mkdir '/app/public/uploads/places'`. The mounted upload directory was root-owned while the app ran as `nextjs`. Fixed in the Dockerfile: the container prepares the upload directory as root, then drops to `nextjs` via `su-exec`.
- **Runtime uploads would not have been served.** Next.js only serves `public/` files present at build time. Added `src/app/uploads/[...path]/route.ts` to serve files from `UPLOAD_ROOT`, with traversal protection, an extension allowlist, and byte-range support for video.
- **Canonical host.** Auth.js already resolves callback URLs to `https://www.accesslens.ca`, and canonical/OG tags use www. The apex host served pages directly, so it now 308-redirects to www.

## Launch Verification

- [ ] Coolify persistent upload volume configured and tested (upload → redeploy → restart)
- [x] Auth.js URL resolves to `https://www.accesslens.ca` in production (from `/api/auth/providers` on both hosts)
- [x] Canonical app URL is `https://www.accesslens.ca` in production (from canonical/OG tags)
- [ ] Manual sign-in → navigate → refresh → sign-out → sign-in round trip in a private window
- [x] WCAG 2.2 AA code-level review completed (see below); manual screen-reader (NVDA), 200%/400% zoom, and mobile touch passes still to be done by a person
- [x] Accessibility defects found during the code review resolved
- [x] Victoria snapshot refreshed from production
- [ ] Sponsor prospectus approved
- [x] Production build verified locally (test, lint, typecheck, build)
- [x] Production health verified
- [ ] Upload persistence verified

## WCAG 2.2 AA Review — Code-Level Findings and Fixes

This is a developer code review plus rendered-HTML checks. It is not a formal audit or certification.

- [x] Keyboard: photo thumbnails were click-only `div`s → now buttons; lightbox and review modal get initial focus, a Tab trap, Escape to close, and focus returns to the trigger (`src/hooks/useDialogFocus.ts`); the lightbox supports arrow keys; the mobile menu closes on Escape
- [x] Hidden file inputs were `aria-hidden` but still tabbable → `tabIndex={-1}` (the labelled drop zones remain the controls)
- [x] Screen reader: desktop nav links had `role="listitem"`, which removed their link semantics → real `ul`/`li`; the place-card score used `aria-label` on a generic `div` → visible text plus an sr-only prefix
- [x] Landmarks: nested `<main>` in the business access wizard removed; the skip-link target `<main id="main">` is now focusable (`tabIndex={-1}`)
- [x] Page titles: `/signin`, `/signup`, `/places/new`, and `/update-accessibility` had the generic site title → descriptive titles
- [x] Contrast: checklist Yes/No/Unknown text (green-600 3.3:1, red-500 3.8:1, slate-400 2.6:1) → 700/700/600 shades; score `/100` at 70% opacity (2.7:1) → full colour; slate-400 secondary text, placeholders, and password-toggle icons → slate-500 (4.8:1)
- [x] Headings: every checked public page renders exactly one `<h1>`
- [x] Colour is not the only signal: score badges carry text labels (Highly Accessible / Partially Accessible / Accessibility Barriers)
- [x] Maps: `/explore` and city pages list places as text alongside the map; place pages show the address as text
- [x] Reduced motion: `prefers-reduced-motion` and the in-app reduce-motion setting are respected globally
- [ ] Remaining manual passes: NVDA walkthrough, 200%/400% zoom and reflow, mobile touch targets on a device

## Verification

Verified locally on 2026-09-26:

```bash
npm run test        # 31 Vitest tests pass (7 files)
npm run lint        # 0 errors; one existing <img> optimization warning (admin submission thumbnails, has alt text)
npm run typecheck   # passes
npm run build       # passes; local build logs MongoDB auth warnings (local env only)
npm run test:e2e    # needs build + seeded Mongo
```

## Remaining Risks

- Upload persistence depends on the Coolify storage mapping for `/app/public/uploads`. The Coolify API available here does not expose storage mounts, so verify it by uploading, redeploying, and restarting
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` were checked from observable behaviour without reading secret env values. The guide's suggested apex value (`https://accesslens.ca`) is not what production uses; production is consistently on www
- Later/product-gated: Stripe billing (only when a business asks to pay), enhanced business profiles, AI photo analysis, Apple sign-in, street-view scanning, native mobile
