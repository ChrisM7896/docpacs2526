const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const logger = require('../modules/logger');
const dbPath = path.resolve(__dirname, '../database/data.sqlite');

// Configure session middleware
const sessionMiddleware = session({
    store: new SQLiteStore({
        db: dbPath,
        table: 'sessions'
    }),
    secret: process.env.SESSION_SECRET, // Replace with your own secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
});

// Export the session middleware
module.exports = sessionMiddleware;
