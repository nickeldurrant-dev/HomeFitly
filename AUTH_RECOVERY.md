# Account recovery routes

This branch adds real static entry points at `/auth/callback/` and `/auth/confirm/` for the live homefitly.com GitHub Pages site. Recovery links validate their session, offer a new-password form, clear tokens from the address bar, and keep tokens only in memory. Confirmation links provide a separate success message. Expired links display a usable error.

`npm test` covers token parsing, recovery/confirmation distinction, token validation, password validation and update errors. `npm run build` type-checks the active landing page and auth routes before building all three HTML entries. Legacy application files are retained but are not active website entry points. The dependency audit is clean following the Vite/Tailwind toolchain update.

Deploying this branch does not release the iPhone app. The Supabase auth URL also needs its invisible character removed and both callback path variants allowed. Those narrowly scoped settings are prepared in the native iPhone repository under `Backend/auth-config/`.

After deployment, verify both callback paths return their own HTML page and complete a real recovery flow with a disposable QA account before distributing the fixed iPhone build.
