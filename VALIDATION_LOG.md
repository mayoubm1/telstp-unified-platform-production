# TELsTP Validation Log

## Local zero-placeholder preview

A locally served development preview of the rebuilt TELsTP OmniCognitor loaded successfully through a public sandbox proxy. The browser title is **TELsTP OmniCognitor** and the initial loading state rendered as designed:

> Connecting to TELsTP live data — No dashboard values are shown until the configured data sources respond.

The browser-control extension then timed out while polling the connected personal browser, so the post-query rendered state could not be captured through that browser session. Independent read-only REST checks against the same configured Supabase client endpoint confirmed that `global_hubs` returns 21 real records, while `messages` and `conversations` return 0 and the `workspaces` request returns the known RLS recursion error. No database mutation occurred.

## Build status

- `CI=true npm test -- --watchAll=false`: passed, 1/1 tests.
- `npm run build`: compiled successfully.
- `npm ci` initially failed because `package-lock.json` was missing `yaml@2.9.0`; `npm install` synchronized the lock file and installed dependencies.

## Production deployment verification

- The verified release was committed on `branch-1` as `94e87bf` (`Replace dashboard placeholders with live TELsTP data`) and pushed to the authoritative GitHub remote.
- The public Vercel domain returned `HTTP/2 200` and served the newly generated bundle fingerprint `static/js/main.6f6e9b43.js`, matching the local successful build.
- The production document metadata now reports the TELsTP OmniCognitor title, the live transparent-operations description, and the dark TELsTP theme color.
- The connected-browser extension again timed out before it could capture the fully rendered client-side query state. This does not alter the independent REST result: `global_hubs` returns 21 live records, `messages` and `conversations` return 0, and `workspaces` is unavailable because of the pre-existing RLS recursion error.
