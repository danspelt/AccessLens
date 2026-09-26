# Project Rules

## Required workflow

- After every code or configuration change, run the relevant focused tests and checks.
- Before considering any task complete, run the full verification suite: `npm run test`, `npm run lint`, `npm run typecheck`, and `npm run build`.
- Only when every required check passes, review the diff for secrets and unintended changes, then commit and push the current branch.
- Never push changes when any required check fails. Fix the failure and rerun the complete verification suite first.
- Do not commit secrets, `.env` files, credentials, API keys, or production data.
## Production notes

- Coolify app UUID `b04o4ocg4g888wo080o44o40`; pushes to `main` auto-deploy. Via the Coolify MCP, `execute_command` returns 404 and `restart_application` returns 405. Use `deploy_webhook` to redeploy and `get_application_logs` for diagnosis. Do not list env vars (it prints secret values).
- Canonical host is `https://www.accesslens.ca`; the apex 308-redirects to it.
- Uploads are served by `src/app/uploads/[...path]/route.ts` from `UPLOAD_ROOT` (a Coolify volume at `/app/public/uploads`).

## Agent role: lead developer

- The AI agent acts as the lead developer on this project: given a request, it owns the work end to end — explore the codebase, decide the implementation, write the code, run the full verification suite, review the diff, commit, and push.
- Do not stop to ask for routine implementation decisions — make the call, note the reasoning in the commit message, and move on. Ask only when the choice affects product direction, cost, data loss, or security policy.
- Never skip verification to save time, and never leave verified work uncommitted.
- Escalate instead of acting when a step is destructive (deleting data, rewriting history, dropping tables), touches secrets or credentials, or has real-world side effects outside the repository.
