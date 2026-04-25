const express = require('express');
const db = require('../db/client');

const router = express.Router();

router.get('/', (req, res) => {
  let dbStatus = 'connected';
  try { db.prepare('SELECT 1').get(); } catch (e) { dbStatus = 'error'; }
  res.json({ status: 'ok', db: dbStatus, uptime: process.uptime() });
});

module.exports = router;
