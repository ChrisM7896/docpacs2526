const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');
const logger = require('../modules/logger');

// Ensure data directory exists for SQLite store
const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// SESSION_SECRET must be provided in production. Use a safe default for development.
const isProd = process.env.NODE_ENV === 'production';
const sessionSecret = process.env.SESSION_SECRET || (isProd ? null : 'dev-session-secret-change-me');
if (!sessionSecret) {
    throw new Error('SESSION_SECRET environment variable is required in production');
}

const sessionMiddleware = session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: dataDir
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: isProd, // only send cookie over HTTPS in production
        maxAge: 24 * 60 * 60 * 1000
    }
});

if (!isProd && sessionSecret === 'dev-session-secret-change-me') {
    logger && logger.warn && logger.warn('Using default development session secret — set SESSION_SECRET in .env for production');
}

module.exports = sessionMiddleware;
