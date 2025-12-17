// scripts/initDatabase.js
require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const logger = require('../modules/logger');

const DATABASE_FILE = process.env.DATABASE_FILE || './data/database.sqlite';

const db = new sqlite3.Database(DATABASE_FILE, (err) => {
    if (err) {
        logger.error('Could not connect to database for initialization', { error: err.message });
        process.exit(1);
    } else {
        logger.info('Connected to database for initialization');
    }
});

// Create tables
const createTables = () => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT,
        formbarId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            logger.error('Error creating users table', { error: err.message });
        } else {
            logger.info('Users table created or already exists');
        }
    });

    // You can add more tables here as needed
};

createTables();

// Close database connection
db.close((err) => {
    if (err) {
        logger.error('Error closing database', { error: err.message });
    } else {
        logger.info('Database initialization complete');
    }
});
