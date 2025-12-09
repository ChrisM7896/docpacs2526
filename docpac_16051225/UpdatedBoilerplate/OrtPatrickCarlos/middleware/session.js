const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');
const logger = require('../modules/logger');
const dbPath = path.resolve(__dirname, '../data/database.sqlite');


// Debug logging
console.log('Session middleware trying to use database at:', dbPath);
console.log('Does database file exist?', fs.existsSync(dbPath));
console.log('Does data folder exist?', fs.existsSync(path.dirname(dbPath)));
console.log('Current working directory:', process.cwd());


// Configure session middleware
const sessionMiddleware = session({
    store: new SQLiteStore({
        db: 'database.sqlite',  // Just the filename
        dir: path.resolve(__dirname, '../data'), // Directory separately
        table: 'sessions'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
});


// Export the session middleware
module.exports = sessionMiddleware;
