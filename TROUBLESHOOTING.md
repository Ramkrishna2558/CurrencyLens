# MudraLens Troubleshooting

## Noon.com prices not converting

### What is fixed in this build
- Currency symbol + number split across sibling nodes is now detected.
- RTL separator handling includes hidden direction marks used on Arabic pages.

### Typical Noon markup issue
- The symbol and amount are often split (example: one node has `?`, next node has `4098.95`).
- Older text-node-only scans can miss that split.

## Console errors you posted

These are usually unrelated to MudraLens conversion logic:

- `net::ERR_BLOCKED_BY_CLIENT`
  - Commonly caused by ad blockers/privacy filters blocking telemetry domains.
  - Affects requests like `sentry.noon.team`, `etracker.noon.com`, `s.go-mpulse.net`.

- `Error with Permissions-Policy header: Unrecognized feature: 'browsing-topics'`
  - Emitted by the site/browser policy parser.
  - Not a content-script runtime error.

- Noon `400` API responses in site scripts
  - Site-internal API behavior.
  - Not an indicator that MudraLens failed.

## Fast verification steps

1. Reload extension at `chrome://extensions`.
2. Hard refresh Noon product page.
3. Open Console and run:
```js
console.log('badges:', document.querySelectorAll('.cl-converted').length);
```
4. If `0`, inspect the price container and confirm the visible price is real text (not SVG/canvas/image).

## Optional debug mode

1. In `content.js`, set `const DEBUG = true`.
2. Reload extension and refresh page.
3. Check logs prefixed with `[MudraLens Debug]`.

## Known limits
- No conversion for prices rendered as image/canvas/SVG text.
- No conversion inside cross-origin iframes.
- No shadow-root traversal unless explicitly implemented.

