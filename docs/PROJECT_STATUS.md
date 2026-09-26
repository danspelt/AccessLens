# Project Status — AccessLens

**Last updated:** September 26, 2026
**Status:** Launch-ready for sponsor outreach. All launch gates verified; remaining items are business development
**Live:** https://www.accesslens.ca (canonical; apex `accesslens.ca` 308-redirects to www)
**Deploy:** Coolify → `main` branch, Dockerfile build pack
**Health:** `GET /api/health` → 200, database connected (verified 2026-09-26)

---

## Where We Are

- Next.js 16, React, Tailwind, MongoDB, Auth.js v5, Leaflet/OpenStreetMap, Zod
- Accessibility checklist + scoring, Places/Reviews/Reports APIs, photo uploads, maps, admin moderation, badges, followed-place notifications
- Public legal pages live (`/privacy`, `/terms`, `/cookies`, `/accessibility`) grounded in actual product behavior
- Public dataset: **48 active Victoria records** and Vancouver seed data; see [Victoria Accessibility Snapshot](VICTORIA_ACCESSIBILITY_SNAPSHOT.md) (recomputed from the live API 2026-09-26 — counts unchanged)
- [Sponsor prospectus](SPONSOR_PROSPECTUS.md) finalized and a first [outreach email](SPONSOR_OUTREACH_EMAIL.md) drafted; no outreach has been sent

## Launch Findings (2026-09-26)

- **Production uploads were broken.** A test upload returned 500: `EACCES: permission denied, mkdir '/app/public/uploads/places'`. The mounted upload directory was root-owned while the app ran as `nextjs`. Fixed in the Dockerfile: the container prepares the upload directory as root, then drops to `nextjs` via `su-exec`.
- **Runtime uploads would not have been served.** Next.js only serves `public/` files present at build time. Added `src/app/uploads/[...path]/route.ts` to serve files from `UPLOAD_ROOT`, with traversal protection, an extension allowlist, and byte-range support for video.
- **Canonical host.** Auth.js already resolves callback URLs to `https://www.accesslens.ca`, and canonical/OG tags use www. The apex host served pages directly, so it now 308-redirects to www.

## Launch Verification

- [x] Coolify persistent upload volume configured and tested: after the fix, an anonymous test upload returned 201 and `/uploads/places/0215aa51-6fd8-4ec1-a4d1-8bcf50837480.png` served 200 `image/png`. It still served after a full redeploy that replaced the container. The Coolify MCP restart endpoint returns 405, so a separate in-place restart was not run; container replacement is the stricter test
- [x] Auth.js URL resolves to `https://www.accesslens.ca` in production (from `/api/auth/providers` on both hosts)
- [x] Canonical app URL is `https://www.accesslens.ca` in production (from canonical/OG tags)
- [x] Auth round trip in a fresh browser context (Playwright, production, credentials provider): sign in → `/dashboard`; `/explore`, a place page, `/dashboard`, `/favorites` stay signed in; refresh keeps the session; Logout clears it; `/dashboard` then redirects to `/signin?callbackUrl=%2Fdashboard`; second sign-in works. All 22 navigations stayed on `https://www.accesslens.ca`
- [x] WCAG 2.2 AA review completed (code review plus automated browser checks; see below)
- [x] Accessibility defects discovered during review resolved
- [x] Victoria snapshot refreshed from production
- [x] Sponsor prospectus approved (finalized 2026-09-26; Dan delegated sign-off)
- [x] Production build verified (test, lint, typecheck, build)
- [x] Production health verified
- [x] Upload persistence verified (survived a redeploy on 2026-09-26)

## WCAG 2.2 AA Review

Manual WCAG 2.2 AA review completed. This combined a code review with automated browser checks against production. It is not a formal audit or certification.

Automated checks (Playwright + axe-core, WCAG 2.0/2.1/2.2 A/AA rules) ran against 17 public and 11 signed-in pages. They covered desktop, a 320px viewport (reflow at 400% zoom, including axe `target-size`), a keyboard Tab walk (skip link first, skip target receives focus, visible focus indicator, accessible names), and `prefers-reduced-motion: reduce`. After fixes, there are **no remaining violations**. The only remaining flag is a heuristic false positive for label-wrapped checkboxes on `/settings`; axe's `label` rule passes there.

Fixed:

- [x] Keyboard: photo thumbnails were click-only `div`s → buttons. Lightbox and review modal get initial focus, a Tab trap, Escape to close, and focus return (`src/hooks/useDialogFocus.ts`; verified live on the review modal). The lightbox supports arrow keys; the mobile menu closes on Escape
- [x] Nested interactive controls: `<Link><Button>` on dashboard/student pages → links styled via `buttonClasses()`. A link inside the signup account-type button was moved out. File inputs were moved out of `role="button"` drop zones
- [x] Screen reader: desktop nav links had `role="listitem"`, which removed their link semantics → real `ul`/`li`. The place-card score used `aria-label` on a generic `div` → visible text plus an sr-only prefix. The mini-map marker got a role and a name. The pitch stats `<dl>` now uses valid `dt`/`dd`
- [x] Landmarks and focus: nested `<main>` removed; the skip-link target is focusable. Sign-in no longer autofocuses the email field (it skipped the heading and skip link)
- [x] Page titles: `/signin`, `/signup`, `/places/new`, `/update-accessibility` now have descriptive titles
- [x] Contrast: `primary-600` darkened to `#026fab` (links, eyebrows, and primary buttons were 3.6–4.1:1, now 4.7–5.4:1). Checklist Yes/No/Unknown, red feature chips, score "/100", slate-400 secondary text, placeholders, and password toggles all now meet 4.5:1
- [x] Reflow: grid blowout caused horizontal scroll at 320px on the home and city pages → `grid-cols-1` (`minmax(0,1fr)`) on mobile-first grids
- [x] Headings: every public page renders exactly one `<h1>`
- [x] Colour is not the only signal: score badges carry text labels
- [x] Maps: `/explore` and city pages list places as text alongside the map; place pages show the address as text
- [x] Reduced motion: no running animations under `prefers-reduced-motion: reduce`

Not covered by tooling (recommended when possible, not launch-blocking): a human NVDA walkthrough and a check on a physical phone.

## Verification

Verified locally on 2026-09-26:

```bash
npm run test        # 31 Vitest tests pass (7 files)
npm run lint        # 0 errors; one existing <img> optimization warning (admin submission thumbnails, has alt text)
npm run typecheck   # passes
npm run build       # passes; local build logs MongoDB auth warnings (local env only)
npm run test:e2e    # needs build + seeded Mongo
```

## Housekeeping

Test artifacts left in production (harmless; there is no in-app deletion path):

- Upload volume: `places/0215aa51-6fd8-4ec1-a4d1-8bcf50837480.png` (1×1 PNG)
- Users: `danspelt24+accesslens-authtest@gmail.com` and `danspelt24+accesslens-a11ytest@gmail.com` (reviewer accounts with random, discarded passwords; no content)

## Remaining Risks

- Uploads live on the Coolify volume. Confirm it is included in server backups
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` were checked from observable behaviour without reading secret env values. Production is consistently on www
- Later/product-gated: Stripe billing (only when a business asks to pay), enhanced business profiles, AI photo analysis, Apple sign-in, street-view scanning, native mobile
