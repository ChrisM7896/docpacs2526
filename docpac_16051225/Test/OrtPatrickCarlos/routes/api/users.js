const express = require('express');
const router = express.Router();
const isAuthenticated = require('../../middleware/isAuthenticated');
const db = require('../../modules/db');
const logger = require('../../modules/logger');

router.get('/', isAuthenticated, async (req, res) => {
  try {
    const rows = await db.allAsync('SELECT id, username, formbarId, createdAt FROM users ORDER BY id ASC');
    res.json({ users: rows });
  } catch (err) {
    logger.error('Failed to fetch users: ' + err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

module.exports = router;
