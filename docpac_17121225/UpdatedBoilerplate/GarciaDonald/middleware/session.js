// creating and exporting session middleware configured with express-session and connect-sqlite3
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const connect_sqlite3 = require('connect-sqlite3')(session);
const logger = require('../modules/logger.js');
// reading configuration from environment variables
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_secret';
// setting up session store
const sessionStore = new connect_sqlite3({
    db: 'sessions.sqlite',  
    dir: './',
    table: 'sessions'
});
// exporting session middleware
module.exports = session({
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3.5 * 60 * 60 * 1000, // 3.5 hours
        // secure is true for production (https) and false for development (http)
        secure: process.env.NODE_ENV === 'production'

    }
});
app.use(sessionMiddleware); 
// attaching the session middleware to socket.io handshake
io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});
