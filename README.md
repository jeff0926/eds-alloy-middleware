# eds-alloy-middleware

A standalone Adobe EDS (Franklin) site paired with Alloy.js client-side data collection, backed by a Node + Express + SQLite capture middleware. No Adobe Experience Platform license required.

## Architecture

- `/site/` — Adobe AEM Boilerplate, deployed via AEM Code Sync to `*.aem.page`
- `/middleware/` — Express server that receives Alloy XDM payloads and stores them in SQLite

## Run Locally

Two terminals:

```bash
# Terminal 1: middleware
cd middleware
node server.js
# Listens on http://localhost:3000

# Terminal 2: EDS site
cd site
npm start
# Serves on http://localhost:3001 (or boilerplate default)
```

> Note: the AEM CLI dev server (`aem up`) defaults to port 3000, which collides with the middleware. Either start the middleware on a different port (`PORT=4000 node server.js` and update `edgeDomain` in `site/scripts/alloy-init.js`) or pass `--port 3001` to the AEM CLI. v1 picks the simplest path: keep middleware on 3000 and run the site on a different port.

## Verify

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/collect \
  -H "Content-Type: application/json" \
  -d '{"events":[{"xdm":{"eventType":"web.webpagedetails.pageViews","web":{"webPageDetails":{"name":"Test","URL":"http://localhost/"}}}}]}'
curl http://localhost:3000/events
```

## Deploy

The `/site/` portion auto-publishes to `*.aem.page` via AEM Code Sync (install the GitHub App on this repo).

The `/middleware/` portion is **not** publicly hosted yet. Until it is, Alloy events on the live site will fail to POST. Hosting the middleware is a separate brick (Railway recommended).

## Snap-In Seams

This project has two seams designed for a future integration system (see `/docs/snap-in-seams.md`).
