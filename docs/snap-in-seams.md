# Snap-In Seams

This project is designed with two integration contracts that allow a future system to plug in without modifying the core code.

## Seam 1 — Content Ingress

**Path:** `/site/content/`
**Format:** Plain markdown
**Convention:** Filename = URL slug; EDS-standard authoring rules
**Use:** A future system writes generated content as markdown files into this directory; AEM Code Sync publishes them automatically.

## Seam 2 — Signal Egress

**Endpoint:** `GET /events` on the middleware
**Response:** `{ count: N, events: [...] }`
**Query params:**
  - `limit` (default 50, max 500)
  - `since` (ISO8601 timestamp)
  - `identity` (filter by ECID or other identity)
**Use:** A future system polls or subscribes to this endpoint to consume the behavioral signal stream as input to its own logic.

Both seams are dormant in Phase 1. They exist as clean integration points for Phase 2.
