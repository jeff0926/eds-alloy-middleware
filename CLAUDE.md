# CLAUDE.md — eds-alloy-middleware

**Project:** EDS + Alloy + Capture Middleware (standalone)
**Owner:** 864zeros LLC / Jeff Conn
**Relationship to AETHER:** None. AETHER is a separate project at `C:\Users\I820965\dev\aether\`. Do not import, reference, or scaffold for AETHER in this repo.

---

## What This Project Is

A standalone edge-publishing site that demonstrates Adobe EDS (Franklin) free-tier deployment paired with Alloy.js client-side data collection — without an Adobe Experience Platform (AEP) license. Behavioral signals captured by Alloy.js are POSTed to a local middleware that normalizes and stores them.

This project intentionally has **two snap-in seams** for a future system (AETHER) to plug into:

| Seam | Direction | Mechanism |
|---|---|---|
| Content ingress | Inbound | Markdown files in `/site/content/` consumed by EDS rendering pipeline |
| Signal egress | Outbound | SQLite event stream + REST endpoint at `/events` |

Both seams must remain **dormant but architected** in Phase 1. Do not build AETHER integration logic. Do build the seams cleanly.

---

## Hard Rules

1. No AETHER code, dependencies, or imports. This repo ships standalone.
2. Default EDS blocks only — hero, cards, columns, fragment.
3. Alloy.js loaded from CDN. No Adobe Tags, no Launch, no AEP.
4. No real Adobe credentials anywhere.
5. Middleware is Node + Express + SQLite. No Postgres, no Redis, no Docker for v1.
6. No AETHER UI patterns (Ψ layer, EDS slivers, CSS Stream).

---

## Architecture

```
Browser (page on *.aem.page)
  ↓ alloy.js (from CDN)
  ↓ sendEvent() — XDM payload
  ↓ POST → middleware /collect endpoint
  ↓
Express middleware
  ↓ validate XDM, normalize, INSERT
  ↓
SQLite (./data/events.db)
  ↓
GET /events — recent events as JSON for inspection
```

### Folder Structure

```
eds-alloy-middleware/
├── CLAUDE.md
├── README.md
├── .gitignore
├── /site/                       — EDS boilerplate fork (Adobe AEM)
│   ├── /blocks/                 — default blocks only
│   ├── /styles/
│   ├── /scripts/
│   │   ├── scripts.js
│   │   └── alloy-init.js        — our Alloy bootstrap
│   ├── /content/                — markdown content (snap-in seam: content ingress)
│   ├── head.html
│   └── ...standard EDS files
├── /middleware/                 — Node Express server
│   ├── server.js
│   ├── /routes/
│   │   ├── collect.js
│   │   ├── events.js
│   │   └── health.js
│   ├── /db/
│   │   ├── schema.sql
│   │   └── client.js
│   └── package.json
└── /docs/
    └── snap-in-seams.md
```

---

## Decision Defaults

| Question | Default |
|---|---|
| EDS boilerplate source | Clone `https://github.com/adobe/aem-boilerplate`, strip `.git` |
| Alloy version | Latest 2.x from `https://cdn1.adoberesources.net/alloy/2.x/alloy.min.js` |
| Middleware port | 3000 |
| Storage | SQLite via `better-sqlite3` |
| Express version | 4.x |
| Node target | 18+ |
| Body parser | `express.json()` 1MB limit |
| CORS | Permissive for `localhost:*` only in dev |
| Logging | `console.log` for v1 |
| TypeScript | No. Plain JS only. |
| Naming | kebab-case files, camelCase functions, snake_case DB columns |

---

## Alloy → Middleware Trick

Alloy expects an Adobe Edge Network response shape. Our middleware returns:

```json
{ "requestId": "<uuid>", "handle": [] }
```

Alloy is configured with `edgeDomain` pointing at our middleware. Datastream ID is a placeholder (`local-dev-stream`) — our middleware does not validate it. **This is the key trick that makes the AEP-less pattern work.** Document it in `alloy-init.js` comments.

---

## SQLite Schema

```sql
CREATE TABLE events (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  received_at     TEXT NOT NULL,
  event_type      TEXT,
  identity_id     TEXT,
  page_url        TEXT,
  page_title      TEXT,
  raw_payload     TEXT NOT NULL
);

CREATE INDEX idx_events_received_at ON events(received_at);
CREATE INDEX idx_events_identity    ON events(identity_id);
```

---

## Snap-In Seam Contracts (Phase 2 Preview — Do Not Implement)

### Content Ingress (`/site/content/`)
- Plain markdown files; filename = URL slug
- EDS standard authoring conventions
- Phase 2: AETHER capsule outputs write here

### Signal Egress (`GET /events`)
- Returns recent events as JSON array
- Query params: `?limit=100&since=<iso8601>&identity=<id>`
- Phase 2: AETHER polls or subscribes as DAI pulse intent source

Both contracts are documented in `/docs/snap-in-seams.md`.

---

## Style

- KISS. Every line earns its place.
- Bricks, not blobs. Each route, each module, one job.
- Comments explain *why*, not *what*.
- No premature abstraction.
