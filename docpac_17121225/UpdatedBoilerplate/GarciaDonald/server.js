// imports
require('dotenv').config();
// constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'default_secret';
const AUTH_URL = process.env.AUTH_URL || 'http://formbeta.yorktechapps.com/oauth';
const THIS_URL = process.env.THIS_URL || 'http://localhost:3000/login';
const API_KEY = process.env.API_KEY || 'default_api_key';

// modules
const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');
const logger = require('./modules/logger');
const sqlite3 = require('sqlite3').verbose();
const connect_sqlite3 = require('connect-sqlite3')(session);
const { io } = require('socket.io-client');
const http = require('http');
// setting up the database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        logger.error('Could not connect to database', err);
    } else {
    logger.info('Connected to SQLite database'); 
} 
});   
// session database
const sessionStore = new connect_sqlite3({
    db: 'sessions.sqlite',
    dir: './',
    table: 'sessions'
});
// middleware
app.use(express.json());
app.use(express.static('public'));
// app.use(express.urlencoded({ extended: true }));
app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3.5 * 60 * 60 * 1000, // 3.5 hours
        // secure is true for production (https) and false for development (http)
        secure: process.env.NODE_ENV === 'production'

    }
}));
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}
// routes
// home route
app.get('/',  (req, res) => {
    res.render('index');
});
// login route
app.get('/login', isAuthenticated, (req, res) => {
    res.render('login');
});
// profile route
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile');
});
// sockets
const server = http.createServer(app);
const ioServer = require('socket.io')(server);
// start server
server.listen(PORT, () => {
    console.log(`Server is running at http://192.168.1.165:${PORT}`);
});
// export app for testing
module.exports = app;
module.exports.db = db;
module.exports.sessionStore = sessionStore; 