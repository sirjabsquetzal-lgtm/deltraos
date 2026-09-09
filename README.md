# DeltraOS

A disciplined trading-journal PWA, built by JABS.

Nothing-OS-styled (black/red/grey/white, dot grid, Archivo/Chivo Mono, 0-radius
Modernist system), fully bilingual (Español default / English), Paper/Black
themes. Every trade is sized off a compounding capital plan; the 4-step trade
model (Mental State → Fundamentals → General Trend → Scalping Auction Zone)
gates entries with a non-skippable meditation timer and an InsaneScalp
confirmation step before registering a trade.

## Stack

- React 19 + TypeScript, built with Vite.
- No backend — all state (plans, trades, capital movements, settings, the
  Sueños collage) lives in `localStorage` on-device. This is a personal,
  single-user tool by design.
- Installable PWA (manifest + a small offline app-shell service worker).

## Run it locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # production build to dist/
npm run preview   # serve the production build
```

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` builds the app and publishes `dist/` to GitHub
Pages on every push to `main`. One-time setup on GitHub (can't be done from a
git push): **Settings → Pages → Source: "GitHub Actions"**. After that, the
site is live at `https://sirjabsquetzal-lgtm.github.io/deltraos/` and updates
automatically on every push.

### Installing it on Android (Brave)

1. Open the Pages URL above in Brave.
2. Menu (⋮) → **Install app** (or use the banner that shows up automatically).
3. Confirm. It lands on your launcher with its own icon, no browser chrome,
   and keeps working offline afterwards — the service worker (`public/sw.js`)
   caches the app shell the first time you open it.

If you push an update and the phone still shows the old version, the service
worker's cache name (`CACHE` in `public/sw.js`) needs bumping so it doesn't
keep serving the stale cached shell.

## Source layout

- `src/types.ts` — domain types (plans, trades, snapshots, settings).
- `src/store.tsx` — the reducer, all state transitions, localStorage
  persistence, the CME-session day-rollover clock, and the meditation
  countdown.
- `src/logic.ts` — pure math: market-session windows, the compounding plan
  table, formatting.
- `src/view.ts` — derived view data (equity curve paths, trade scoping,
  confidence/side/hint calculations) built on top of `logic.ts`.
- `src/i18n.ts` — the ES/EN dictionary and templated-string helpers.
- `src/glyphs.tsx` — the line-art SVGs used by the visual structure/CVD/candle
  pickers.
- `src/screens/*`, `src/sheets/*` — one component per screen/bottom sheet.
- `src/styles.css` — the Modernist design tokens + Nothing-OS shell CSS.

## Limitations to keep in mind

- Data lives **per browser, per device** — installing on two phones (or
  clearing site data) gives two independent histories. Real cross-device
  sync would need a backend.
- `localStorage` has a ~5–10MB ceiling; the Sueños photos you add and the
  meditation track live only for the current session (not persisted across a
  reload) since they can't be serialised into `localStorage` — re-add them
  after a reload if you want them back, or ask for IndexedDB-backed storage
  if that's needed.
