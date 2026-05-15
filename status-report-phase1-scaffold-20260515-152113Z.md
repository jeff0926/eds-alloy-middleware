# Project Status Report — eds-alloy-middleware

**Generated:** 2026-05-15 15:21 UTC
**Branch:** `main` @ `af07d2c`
**Repo:** https://github.com/jeff0926/eds-alloy-middleware

---

## 1. The Idea

A **standalone Adobe Edge Delivery Services (EDS / Franklin) site** wired to **Alloy.js** for client-side behavioral data collection, backed by a **local Node + Express + SQLite middleware** that impersonates the Adobe Edge Network.

The point is to demonstrate the **AEP-less pattern**: get all the Alloy-driven signal capture without paying for Adobe Experience Platform, Datastreams, Tags, or Launch. Alloy is configured with an `edgeDomain` pointing at our middleware instead of Adobe; the middleware returns the minimal Edge Network response shape Alloy expects (`{ requestId, handle: [] }`), so Alloy thinks it's talking to Adobe and keeps shipping XDM payloads. We normalize and store them in SQLite.

The project also reserves **two snap-in seams** for a future companion system (AETHER, which lives in a separate repo and is intentionally untouched here):

| Seam | Direction | Mechanism |
|---|---|---|
| Content ingress | Inbound | Markdown files in `/site/content/` consumed by the EDS rendering pipeline |
| Signal egress | Outbound | SQLite event stream exposed via `GET /events` |

Both seams are dormant in Phase 1 — built as clean integration points, no integration logic.

---

## 2. What's Built

### `/site/` — EDS site
- Adobe AEM Boilerplate (cloned from `adobe/aem-boilerplate`, `.git`/`.github` stripped)
- `site/scripts/alloy-init.js` — Alloy bootstrap that:
  - Loads via stub queue pattern
  - Configures `edgeDomain: "localhost:3000"`, `edgeBasePath: "collect"`
  - Uses placeholder `datastreamId`/`orgId` (middleware does not validate)
  - Fires a `web.webpagedetails.pageViews` event on load
- `site/head.html` patched to inject:
  - Alloy CDN tag: `https://cdn1.adoberesources.net/alloy/2.x/alloy.min.js`
  - `/scripts/alloy-init.js`
  - Both carry the boilerplate's CSP `nonce="aem"` so they pass policy
- `site/content/` directory present (with `.gitkeep`) — the content-ingress seam
- `npm install` runs clean in `/site/` (372 packages)

### `/middleware/` — capture server
- Node + Express 4 + `better-sqlite3` + `cors` + `uuid`
- Routes:
  - `POST /collect` — accepts XDM payloads, extracts `eventType` / `identityMap.ECID` / page URL+title, inserts into SQLite, returns Edge-shaped response
  - `GET /events` — reads back recent events with `limit` / `since` / `identity` query params (this is the signal-egress seam)
  - `GET /health` — basic liveness + DB check
- Schema (`middleware/db/schema.sql`):
  ```sql
  CREATE TABLE events (
    id, received_at, event_type, identity_id, page_url, page_title, raw_payload
  );
  ```
  with indexes on `received_at` and `identity_id`
- Port 3000, CORS permissive for `localhost:*` only, `express.json()` 1MB limit
- `node --check` passes on all `.js` files
- `npm install` runs clean (108 packages, 0 vulnerabilities)
- Server has **not** been started in any environment (validation only)

### Repo plumbing
- `CLAUDE.md` at repo root — operating doc (hard rules, architecture, decision defaults, snap-in seam contracts)
- `README.md` — run/verify/deploy instructions; flags the AEM CLI / middleware port-3000 collision
- `docs/snap-in-seams.md` — explicit contract docs for the two seams
- `.gitignore` — excludes `node_modules/`, `*.db`, `middleware/data/`, `.env`, `.DS_Store`, `.aem-cli/`, `.cache/`
- `fstab.yaml` at repo root — maps `/` to the project's Google Drive folder (`1Z3JMQxQb48jPeZ5iTWSKwGPtTJea1Ov4`) so EDS can resolve pages

### Git history
```
af07d2c  Add fstab.yaml mounting Google Drive folder as content source
f45cdc5  Phase 1: EDS site + Alloy.js + capture middleware (#1)   ← squash-merged from PR #1
cde13ef  Initialize repository
```

PR #1 (https://github.com/jeff0926/eds-alloy-middleware/pull/1) was opened, reviewed in description, and squash-merged.

---

## 3. Current Status

| Component | State |
|---|---|
| Repo scaffold | **Complete** — merged to `main` |
| EDS code on `main` | **Complete** |
| Alloy bootstrap | **Complete** — points at `localhost:3000` |
| Middleware code | **Complete, not deployed** |
| `fstab.yaml` | **Complete** — Drive folder mounted at `/` |
| AEM Code Sync GitHub App | **Installed** on the repo |
| Google Drive content folder | **Created**, shared with `helix@adobe.com` (per user) |
| `index` Google Doc | **Pending verification** (user to confirm exists with H1 + body) |
| AEM Sidekick extension | **Installed** but project not yet registered in Sidekick |
| First Preview / Publish | **Blocked** — needs Sidekick to register the project, then click Preview on the `index` Doc |
| `https://main--eds-alloy-middleware--jeff0926.aem.page/` | **Still 404** — will resolve after first Preview |
| Middleware public hosting | **Not done** — separate Phase 2 brick (Railway recommended) |

---

## 4. Immediate Blockers

1. **Sidekick doesn't recognize a project yet.** User needs to right-click the Sidekick icon → Options → Add project → paste `https://github.com/jeff0926/eds-alloy-middleware`. Sidekick will read `fstab.yaml` from `main` to wire itself up.
2. **First Preview** must happen on a desktop browser. The AEM Admin API cannot be called from this sandbox (`host_not_allowed`), so the trigger must come from the Sidekick toolbar on the Doc page.
3. Once Preview + Publish succeed once, **subsequent authoring can be done from any device** (edit Doc on phone, trigger Preview from any laptop/Chromebook later).

---

## 5. Known Caveats

- **Port collision:** AEM CLI dev server defaults to `3000`, same port as the middleware. Documented in `README.md`; not a deployment-time issue, only relevant for local concurrent dev.
- **Middleware not hosted:** Once the live site is up on `*.aem.page`, Alloy POSTs from the production page will fail until the middleware has a public URL and `edgeDomain` in `alloy-init.js` is updated.
- **No AETHER references** anywhere in the repo — verified by file inspection. AETHER lives in a separate workspace and is not touched.
- **Boilerplate ships its own `site/CLAUDE.md` and `site/AGENTS.md`** governing the EDS sub-tree; these are kept intact and do not conflict with the repo-root `CLAUDE.md` that governs the project.

---

## 6. Next Steps

### Immediate (today, on desktop)
1. Open Sidekick Options → add project URL `https://github.com/jeff0926/eds-alloy-middleware`
2. Open the `index` Doc in the bound Drive folder
3. Sidekick toolbar should appear at top of Doc → click **Preview** → wait for green → click **Publish**
4. Verify `https://main--eds-alloy-middleware--jeff0926.aem.page/` returns the boilerplate's rendering of the `index` Doc

### Phase 2 (separate prompts)
1. Deploy `/middleware/` to Railway (or equivalent public host)
2. Update `site/scripts/alloy-init.js` `edgeDomain` from `localhost:3000` to the public middleware URL
3. Verify Alloy `pageView` events flow from `*.aem.page` → middleware → SQLite (`GET /events`)
4. Begin Phase 2 integration on the dormant snap-in seams (AETHER project)

---

## 7. Decision Log

| Decision | Rationale |
|---|---|
| Use orphan `main` initial commit then rebase feature branch onto it | Repo was empty on arrival, no base branch existed for the PR |
| Squash-merge PR #1 | Keep `main` history clean — one cohesive commit for the scaffold |
| `nonce="aem"` on injected Alloy scripts | Boilerplate's CSP requires it; injecting without nonce would have been blocked or required loosening policy |
| Keep middleware port at 3000 (collision with AEM CLI) | Specified default in CLAUDE.md; documented the conflict and workaround in README rather than diverging from spec |
| Add `site/content/.gitkeep` | Track the empty content-ingress seam directory in git |
| Use `fstab.yaml` rather than Helix 5 / Cloud Manager config service | Free tier; Helix 5 requires AEM Cloud Service license |
