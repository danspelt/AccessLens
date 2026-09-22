# Legal page sources and notes

The four legal-information pages (`/privacy`, `/terms`, `/cookies`,
`/accessibility`) were drafted September 21, 2026 as practical drafts. They
should be reviewed by a qualified BC lawyer before being relied on for material
legal risk.

## What the content is grounded in

The pages describe only what the code actually does:

- Accounts store email, display name, an optional password hash, role, account
  type, badges, optional bio and avatar, display preferences, a
  profile-visibility flag, and `emailNotifications` (`src/models/User.ts`).
  Profile visibility is saved for a future public profile. Published reviews
  still show the account display name (`src/app/api/places/[id]/reviews/route.ts`).
  The settings UI says public profiles are not built yet
  (`src/app/(protected)/settings/settingsClient.tsx`).
- Sign-in is Auth.js with a JWT session: email and password, optional Google
  profile (name, email, picture), and optional Resend magic links (`src/auth.ts`).
  Session lifetime is the Auth.js default of 30 days. Cookie names follow Auth.js
  defaults (`authjs.session-token`, plus short-lived sign-in cookies).
- Business access uses an encrypted HTTP-only cookie,
  `accesslens_business_access`, for 24 hours (`src/lib/business/session.ts`).
- On-device storage: `localStorage` key `accesslens:prefs` and `sessionStorage`
  key `accesslens_signup_intent` (`src/lib/signupIntent.ts`).
- Follows are per account. Meaningful public place changes create an in-app
  notification for every follower except the editor. Email is sent only when
  `emailNotifications === true` (the settings default is false). The email names
  the place and says public accessibility information changed. A delivery
  failure is recorded and does not delete the in-app notice
  (`src/lib/notifications/placeUpdates.ts`). There is no marketing list.
- Issue reports are private moderation records. There is no public issue route
  (`README.md`, `src/models/Report.ts`).
- Place submissions, claim requests, and accessibility updates store the
  submitter’s name and email (`src/models/PlaceSubmission.ts`,
  `src/models/BusinessClaimRequest.ts`,
  `src/models/AccessibilityUpdateRequest.ts`). Student visit logs can store a
  business contact name (`src/models/BusinessVisit.ts`).
- Uploaded media is served from a public URL (`/uploads`, `src/proxy.ts`).
- The browser loads OpenStreetMap tiles from `tile.openstreetmap.org`. Address
  lookup calls `nominatim.openstreetmap.org` from the server. Geocode results
  are cached in MongoDB. Client IP addresses for the geocode rate limit stay in
  process memory (`src/app/api/geocode/route.ts`).
- Fonts are self-hosted with `next/font` (`src/app/layout.tsx`). No analytics
  script is loaded. There is no self-serve account-deletion flow.
- City of Victoria accessible-parking candidates keep that city’s open-data
  licence and a non-guarantee disclaimer (`README.md`,
  `src/lib/imports/victoriaAccessibleParking.ts`).
- Website accessibility measures that exist today: skip link
  (`src/components/layout/SkipLink.tsx`), `prefers-reduced-motion` and signed-in
  display settings (`src/app/globals.css`, settings). Community photo alternative
  text is generic (`src/components/photos/PhotoGallery.tsx`). Maps use Leaflet.

## Primary sources consulted

- OIPC BC — A Guide to B.C.'s Personal Information Protection Act:
  https://www.oipc.bc.ca/documents/guidance-documents/1371
- OIPC BC — Developing a Privacy Policy under PIPA:
  https://oipc.bc.ca/documents/guidance-documents/2164
- OIPC BC — For Private Organizations: https://oipc.bc.ca/for-private-organizations/
- OIPC BC — Legislation (PIPA scope): https://www.oipc.bc.ca/about/legislation/
- Accessible British Columbia Act + Regulation (BC Reg 105/2022 — prescribed
  organizations are public-sector bodies; AccessLens is not prescribed):
  https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/105_2022
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- W3C conformance guidance ("partial conformance" has narrow criteria and is
  not used as a general label for an incomplete audit):
  https://www.w3.org/WAI/WCAG22/Understanding/conformance
- OPC Canada — how PIPEDA and BC PIPA apply to interprovincial/international
  transactions:
  https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/02_05_d_26/

CASL: optional place-update email stays off until the account turns Email
notifications on. Magic-link messages are sign-in mail. The site does not send
a newsletter or other commercial electronic messages on a schedule.

## Maintenance

When site behavior changes (new forms, analytics, embeds, cookies, third-party
services, or notification email), update the affected page, this note, and the
"Last updated" date.
