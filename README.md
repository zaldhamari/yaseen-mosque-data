# yaseen-mosque-data

Scraped mosque prayer-time data for the [Yaseen](https://github.com/zaldhamari) prayer-times app, kept fresh automatically.

This is a companion repo to the main Yaseen app repo — deliberately separate so the app's source code (which contains API keys and EAS config) never has to be public. This repo only ever contains scraper scripts and the JSON data they produce, both of which are safe to publish.

## What's here

- `scripts/` — the same scraper scripts used in the main app (`scrapeAwqat.ts`, `scrapeMac.ts`, `mergeMac.ts`, `scrapeCanada.ts`, `scrapers/*.ts`)
- `src/data/*.json` — their output: `vancouverMosques.json`, `macMosques.json`, `canadaMosques.json`

## Automation

`.github/workflows/scrape.yml` runs every Monday (and can be triggered manually from the Actions tab), re-runs every scraper, and opens a pull request with whatever changed. **Review the diff and merge it yourself** — this is deliberate, matching the existing philosophy in the main app repo: a bad scrape should never silently become live data.

`.github/workflows/purge-cdn.yml` fires automatically right after you merge, and tells jsDelivr to drop its cache for these files so the CDN URLs below serve the new data immediately instead of waiting out jsDelivr's normal cache window.

## How the app consumes this

The Yaseen app fetches these files at runtime from jsDelivr's GitHub CDN mode (no hosting setup needed — jsDelivr serves any file straight from a public GitHub repo):

```
https://cdn.jsdelivr.net/gh/zaldhamari/yaseen-mosque-data@main/src/data/canadaMosques.json
https://cdn.jsdelivr.net/gh/zaldhamari/yaseen-mosque-data@main/src/data/vancouverMosques.json
```

If the fetch fails (offline, CDN issue, etc.), the app falls back to its own bundled snapshot of this same data, so it never breaks — it's just occasionally a bit less fresh.

## Running scrapers manually

```
npm install
npm run scrape:all      # runs everything: awqat → mac → merge:mac → canada
```

Or individually: `npm run scrape:mosques`, `npm run scrape:mac`, `npm run merge:mac`, `npm run scrape:canada`.

Nominatim (the geocoder these scripts use) enforces 1 request/second — a full `scrape:all` run can take a while.
