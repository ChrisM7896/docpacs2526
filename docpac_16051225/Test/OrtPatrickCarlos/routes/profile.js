const express = require('express');
const router = express.Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const multer = require('multer');
const path = require('path');
const db = require('../modules/db');
const logger = require('../modules/logger');

const uploadsDir = path.resolve(__dirname, '../data/uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const safe = Date.now() + '_' + file.originalname.replace(/[^a-z0-9.\-\_]/gi, '_');
    cb(null, safe);
  }
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const uploads = await db.allAsync('SELECT id, filename, originalName, createdAt FROM uploads WHERE userId = ? ORDER BY createdAt DESC LIMIT 20', user.id).catch(() => []);
  res.render('profile', { user, uploads });
});

router.post('/upload', isAuthenticated, upload.single('file'), async (req, res) => {
  const user = req.session.user;
  if (!req.file) return res.redirect('/profile');
  try {
    await db.runAsync('INSERT INTO uploads (userId, filename, originalName) VALUES (?, ?, ?)', user.id, req.file.filename, req.file.originalname);
    logger.info(`User ${user.username} uploaded file ${req.file.filename}`);
  } catch (err) {
    logger.error('Upload DB error: ' + err.message);
  }
  res.redirect('/profile');
});

module.exports = router;
