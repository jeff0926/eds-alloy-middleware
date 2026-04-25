const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db/client');

const router = express.Router();

const insertStmt = db.prepare(`
  INSERT INTO events (received_at, event_type, identity_id, page_url, page_title, raw_payload)
  VALUES (?, ?, ?, ?, ?, ?)
`);

router.post('/', (req, res) => {
  const body = req.body || {};
  const events = Array.isArray(body.events) ? body.events : (body.xdm ? [{ xdm: body.xdm }] : []);
  const now = new Date().toISOString();

  for (const evt of events) {
    const xdm = evt.xdm || {};
    const eventType = xdm.eventType || null;
    const identityId = xdm.identityMap?.ECID?.[0]?.id || null;
    const pageUrl = xdm.web?.webPageDetails?.URL || null;
    const pageTitle = xdm.web?.webPageDetails?.name || null;
    insertStmt.run(now, eventType, identityId, pageUrl, pageTitle, JSON.stringify(evt));
  }

  // Return Alloy-expected Edge Network response shape
  res.status(200).json({ requestId: uuidv4(), handle: [] });
});

module.exports = router;
