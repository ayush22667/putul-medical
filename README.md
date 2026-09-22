# Putul Medical — website

Mobile-first, bilingual (English / हिंदी) website for Putul Medical, Katihar.
Plain JavaScript (ES modules) + CSS, built with [Vite](https://vite.dev). No framework, no runtime dependencies.

## Quick start

```bash
nvm use            # Node 22 (any Node ≥ 20.19 works)
npm install
npm run dev        # http://localhost:5173 — also reachable from your phone on the same Wi-Fi
```

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Dev server with live reload                         |
| `npm run build`   | Production build into `dist/`                       |
| `npm run preview` | Serve the production build locally                  |
| `npm run lint`    | ESLint                                              |
| `npm run check`   | Lint + build (run before every deploy)              |
| `npm run format`  | Prettier                                            |

## Project structure

```
index.html                 Page shell — stitches partials together
404.html                   Not-found page
src/
  config/site.js           ★ Business details + feature switches (edit this first)
  i18n/en.json, hi.json    All user-facing text, one key per string
  partials/                HTML sections, inlined at build time
    sections/              hero, trust, doctors, diagnostics, get-started, …
    sheets/                bottom-sheet dialogs (menu, story, booking, lab, newsletter, signin)
  styles/                  tokens → base → components → layout → sections → animations
  lib/                     dom, i18n, storage, forms, whatsapp helpers
  modules/                 one file per feature (sheets, upload, booking, reveal, …)
  main.js                  Entry point — initialises every module
public/                    Copied as-is (favicon, web manifest)
vite.config.js             Build config + the html-partials plugin
netlify.toml               Deploy settings, security headers, caching
```

### How the HTML templating works

`vite.config.js` contains a small plugin that runs at build time:

- `<include src="…">` inlines a partial (paths are relative to the including file).
- `{{phoneE164}}`, `{{whatsapp}}`, … are replaced with values from `src/config/site.js`.
  An unknown variable fails the build, so typos can't ship.
- `<!-- feature:signin --> … <!-- /feature:signin -->` blocks are removed when that
  feature is `false` in `site.js`.

The final HTML is fully static, so search engines see all the content.

## Common edits

- **Phone / WhatsApp / address / domain**: `src/config/site.js`.
- **Any text**: the matching key in `src/i18n/en.json` **and** `src/i18n/hi.json`.
  The English text is also written in the partial so the page reads correctly without JS.
- **Doctors, tests, prices**: `src/partials/sections/doctors.html` and `diagnostics.html`
  (+ their text keys).
- **Colours / fonts / spacing**: `src/styles/tokens.css`.

## Forms: where do bookings go?

Doctor bookings, lab bookings, prescription uploads and newsletter sign-ups are sent to
**Netlify Forms** (`features.netlifyForms`). On Netlify they appear under
*Site → Forms*. Turn on email notifications there to get each booking in your inbox.

If a submission can't be stored (a different host, offline, or the feature is off), the
visitor gets a **pre-filled WhatsApp message** to send instead. No request is silently lost.

Notes:
- Netlify Forms accepts uploads up to 8 MB per submission. The site enforces this limit.
- Prescriptions are health data: limit who has access to the Netlify team and form notifications.

## Feature switches (`src/config/site.js`)

| Flag            | Default | Meaning                                                                     |
| --------------- | ------- | --------------------------------------------------------------------------- |
| `netlifyForms`  | `true`  | Record forms with Netlify Forms (otherwise everything goes to WhatsApp)     |
| `newsletter`    | `true`  | 50%-off sign-up sheet (shown once, after the visitor scrolls past halfway) |
| `signin`        | `false` | Sign-in UI. **Front-end only, no backend.** Keep off until real auth exists |
| `demoTracking`  | `false` | Fake tracking timeline. Off in production: tracking opens WhatsApp          |

## Deploy

**Netlify (recommended, because forms work out of the box)**
1. Push this folder to a GitHub repo.
2. Netlify → *Add new site → Import from Git* → pick the repo. `netlify.toml` already sets
   the build command and output folder.
3. Set your custom domain, then update `url` in `src/config/site.js` (used for the canonical
   link, sitemap and social previews) and redeploy.

Any static host (Vercel, Cloudflare Pages, GitHub Pages) also works: build with
`npm run build` and serve `dist/`. On those hosts, forms fall back to WhatsApp.

## Quality notes

- **Performance:** about 20 KB of gzipped JS and 10 KB of gzipped CSS. The hero intro is pure CSS,
  so it plays before any JS loads. Scroll effects use `IntersectionObserver` and
  rAF-throttled listeners.
- **Accessibility:** skip link, labelled controls, focus trap and `inert` background in
  dialogs, Escape to close, 44px+ touch targets, and every animation is disabled under
  `prefers-reduced-motion`.
- **Security:** strict CSP and security headers in `netlify.toml`. No inline scripts.
  User input is only ever written with `textContent`.
- **SEO:** static HTML, meta/OG tags, `Pharmacy` JSON-LD structured data, and a sitemap
  and robots.txt generated at build time.
