# AccessLens Architecture and Environment Contract

This document records the architecture implemented by the current release-candidate branch. It is the reference for staging and production setup; older planning documents do not override the code paths described here.

## System boundary

AccessLens is one Next.js 16 application using the App Router. React pages and server-rendered routes call Next.js route handlers in the same deployment. Those server paths connect directly to MongoDB through the native MongoDB driver.

There is no separate API service, SQL database, CMS, or billing service in the active architecture. Business subscription status is currently a stored placeholder and is not connected to a payment provider.

## Request and data flow

1. A browser requests a page or route from the Next.js application.
2. Auth.js middleware and server helpers establish the signed-in user where required.
3. Route handlers validate input and read or write MongoDB collections.
4. Business QR claim routes use a separate encrypted, HTTP-only iron-session cookie scoped to a place and access code.
5. Optional integrations are called only from server code:
   - Google OAuth for sign-in.
   - Resend for email magic links.
   - OpenStreetMap Nominatim for geocoding, with MongoDB caching.
6. Uploaded files are stored under `UPLOAD_ROOT` (default: `public/uploads`). Public URLs remain under `/uploads`. Production must set `UPLOAD_ROOT` to a persistent, backed-up mounted volume and serve/proxy `/uploads` from that directory, or replace this adapter before launch.

## Authentication model

Auth.js (NextAuth v5) uses JWT sessions and the MongoDB adapter. Email/password credentials are always registered. Google and Resend providers are registered only when both variables for that provider are present.

Business QR access is not an Auth.js login. It is a separate 24-hour iron-session cookie. The business session secret must be independent from the Auth.js secret in production.

## Environment contract

Required in every environment that serves application data:

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string. Include the correct authentication database where required. |
| `MONGODB_DB` | Database name used by the application and Auth.js adapter. |
| `AUTH_SECRET` | Auth.js signing secret, at least 32 characters. `NEXTAUTH_SECRET` is a legacy fallback. |
| `BUSINESS_SESSION_SECRET` | Business QR session encryption secret, at least 32 characters. `SESSION_SECRET` is a legacy fallback. |
| `NEXT_PUBLIC_APP_URL` | Public application URL. Must use HTTPS in production. |
| `AUTH_URL` | Auth.js callback base URL. Required and HTTPS in production. |

Optional integrations and operational settings:

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Enable Google OAuth only when both are set. |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL` | Enable email magic-link authentication only when both are set. |
| `AUTH_TRUST_HOST` | Defaults to trusting the proxy host. Set false only with a fixed `AUTH_URL` and intentional proxy configuration. |
| `NOMINATIM_USER_AGENT` | Identifies the deployment to Nominatim. Set a real monitored contact before production use. |
| `PLAYWRIGHT_BASE_URL` | Runs end-to-end tests against an existing staging URL instead of a locally started server. |

`NODE_ENV` and `CI` are runtime/platform flags and are not application secrets.

## Release gates

Before staging or production promotion:

1. Run `npm run check:env` with the target environment variables.
2. Connect to the intended MongoDB database and run the documented index initialization once.
3. Seed only the approved city/content data; do not treat candidate imports as verified public accessibility data.
4. Confirm `UPLOAD_ROOT` points to persistent, backed-up storage and `/uploads` is served from it.
5. Run lint, type checking, unit tests, build, and Playwright smoke tests against staging.
6. Verify Auth.js callback URLs, Google OAuth redirect URLs if enabled, and a monitored Nominatim contact identity.

Database initialization and seed commands are state-changing operations. They require the target database and backup/rollback plan to be identified before execution.
