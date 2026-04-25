const express = require('express');
const db = require('../db/client');

const router = express.Router();

router.get('/', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const since = req.query.since;
  const identity = req.query.identity;

  let query = 'SELECT * FROM events WHERE 1=1';
  const params = [];

  if (since) {
    query += ' AND received_at >= ?';
    params.push(since);
  }
  if (identity) {
    query += ' AND identity_id = ?';
    params.push(identity);
  }

  query += ' ORDER BY received_at DESC LIMIT ?';
  params.push(limit);

  const rows = db.prepare(query).all(...params);
  res.json({ count: rows.length, events: rows });
});

module.exports = router;
