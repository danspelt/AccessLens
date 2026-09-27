# Central single sign-on (pilot)

AccessLens can accept sign-in from a central OpenID Connect provider (Zitadel Cloud) alongside
email/password, Google and magic links. The provider is inactive until `SSO_ISSUER`,
`SSO_CLIENT_ID` and `SSO_CLIENT_SECRET` are all set, so deploying this code changes nothing on
its own.

## How it behaves

| Situation | Result |
|---|---|
| New person, email not in AccessLens | New AccessLens user with the default `user` role, linked by the provider's `sub` |
| Signed-out person whose email already has an AccessLens account | Refused (`OAuthAccountNotLinked`). They sign in the usual way, then use **Settings → Sign-in methods → Connect** |
| Signed-in person clicks **Connect** | Provider account is linked to the current user (`accounts` collection: `provider: "sso"`, `providerAccountId: <sub>`) |
| Provider reports `email_verified: false` or no email | Refused (`AccessDenied`) |
| Admin at the provider | No effect. AccessLens admin is `users.role === 'admin'`, read from MongoDB on each request |

OAuth access, refresh and ID tokens are not stored. Sign-in and link events are logged as
`auth.signin` / `auth.link` with provider and user ID only.

**Sign out** ends the AccessLens session only. It does not sign the user out of Zitadel or other
sites. Global logout (provider `end_session`) is not implemented in this pilot.

## Zitadel Cloud setup

1. Create a Zitadel Cloud instance and a project (e.g. "Dan's sites").
2. In the project, add an application: **Web**, authentication method **Code** (confidential
   client with PKCE; client secret basic).
3. Redirect URIs — exact values, no wildcards:
   - `https://www.accesslens.ca/api/auth/callback/sso`
   - `http://localhost:3000/api/auth/callback/sso` (enable development mode only on a separate
     dev application if you prefer to keep production strict)
4. Post-logout URI: `https://www.accesslens.ca/`.
5. Under the instance's login policy, require email verification, enable passkeys, and require MFA
   for any account that is an admin in any of Dan's apps.
6. Copy the issuer (`https://<instance>.zitadel.cloud`), client ID and client secret into Coolify:
   `SSO_ISSUER`, `SSO_CLIENT_ID`, `SSO_CLIENT_SECRET`, optionally `SSO_DISPLAY_NAME`.
   Confirm `AUTH_URL=https://www.accesslens.ca` (the www host, not the apex).
7. Redeploy.

## Production verification

Use a private browser window for each case.

1. Anonymous: `/dashboard` redirects to `/signin?callbackUrl=%2Fdashboard`.
2. New Zitadel user: **Continue with …** → lands on `/dashboard` with a normal (non-admin) user.
3. Existing password user, signed out, same email in Zitadel: refused with the "connect from
   Settings" message; no duplicate user appears in `users`.
4. Existing user: sign in with password → Settings → **Connect** → Settings shows "connected".
   Sign out, then sign in with Zitadel → same user, same favourites/reviews.
5. Admin: after linking, `/admin` still works; a non-admin linked user gets 403 on `/api/admin/*`.
6. `/signin?callbackUrl=https://attacker.example` → after sign-in you land on `/dashboard`.
7. Keyboard-only and screen reader pass over `/signin` and Settings (button names, focus, error
   announcement), plus 200%/400% zoom.

## Rollback

Remove (or blank) `SSO_ISSUER` and redeploy. The button and Settings card disappear and all
existing sign-in methods keep working. Linked `accounts` records with `provider: "sso"` are
harmless when the provider is disabled. Keep them so re-enabling restores the links.
