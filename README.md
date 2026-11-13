# HomeFitly website

This repository serves the HomeFitly marketing website, Help Center, policies and account-recovery pages at [homefitly.com](https://homefitly.com).

HomeFitly is a native home-management app. The website is not a web version of the app and does not sell subscriptions. Android is available on [Google Play](https://play.google.com/store/apps/details?id=com.homefitly.app). See [download help](https://homefitly.com/help/#downloads) for current iPhone/iPad availability.

The current app includes recurring tasks, checklists, projects, receipts, warranties and contacts. Premium adds cloud sync, expanded record limits and household sharing. Explicit Owner access shares full household records; Admins and Members have narrower Tasks and Family access. Restricted child-phone connections and in-app Google contractor search are not open to new customers. Current pricing, platform-specific instructions and availability are documented in Help.

## Website sources

- `src/components/LandingPage.tsx`: homepage and Google Play links.
- `public/help/`, `public/privacy/`, `public/terms/`, `public/account-deletion/`: public guidance and disclosures.
- `public/screenshots/`: unaltered Android screenshots already published in the Google Play listing, with fictional example records.
- `auth/` and `src/auth/`: account-confirmation and recovery pages.
- `public/q/`: existing contractor quote portal.

The frontend uses React, TypeScript, Vite and Tailwind CSS. Existing backend files and authentication flows are separate from website copy updates.

## Local checks

```sh
npm ci
npm test
npm run build
npm run dev
```

The build produces `dist/`. Keep credentials and private data out of website files and screenshots.

## Publishing

The existing `.github/workflows/deploy.yml` workflow tests and builds pushes to `main`, then deploys to GitHub Pages for the existing custom domain. Publish reviewed changes to this repository; do not create replacement hosting. Verify the workflow result and the live pages after deployment.
