const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const logger = require('../modules/logger');

async function init() {
  try {
    const dataDir = path.resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

    const dbFile = path.join(dataDir, 'database.sqlite');
    const db = new sqlite3.Database(dbFile);

    // Create users table
    await new Promise((resolve, reject) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          passwordHash TEXT,
          formbarId TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    // Create uploads table
    await new Promise((resolve, reject) => {
      db.run(
        `CREATE TABLE IF NOT EXISTS uploads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId INTEGER,
          filename TEXT,
          originalName TEXT,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(userId) REFERENCES users(id)
        )`,
        (err) => (err ? reject(err) : resolve())
      );
    });

    logger.info('Database initialized at ' + dbFile);
    db.close();
  } catch (err) {
    logger.error('Failed to initialize database: ' + err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  init();
}

module.exports = init;