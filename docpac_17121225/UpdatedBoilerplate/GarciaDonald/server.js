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
console.log('SESSION_SECRET:', process.env.CLIENT_SECRET);
app.use(session({
    store: sessionStore,
    secret: process.env.CLIENT_SECRET || 'insert_session_secret_here',
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
        const tokenData = req.session.token;

        try {
            // Check if the token has expired
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenData.exp < currentTime) {
                throw new Error('Token has expired');
            }

            next();
        } catch (err) {
            res.redirect(`${AUTH_URL}/oauth?refreshToken=${tokenData.refreshToken}&redirectURL=${THIS_URL}`);
        }
    } else {
        res.redirect(`/login?redirectURL=${THIS_URL}`);
    }
}
app.set('view engine', 'ejs');
app.set('views', './views');
// importing routes
const userRoutes = require('./routes/api/users');
// routes
// home route
app.get('/',  (req, res) => {
    res.render('home', {session: req.session});
});
// login route
app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/');
    } else {
        console.log('AUTH_URL being passed:', process.env.AUTH_URL); // Debug line
        res.render('login', {
            session: req.session,
            AUTH_URL: process.env.AUTH_URL || 'http://formbar.yorktechapps.com/oauth',
            loginError: false
        });
    }
});

// profile route
app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile');
});
// auth routes
// Import and use your OAuth routes
const formbarAuthRoutes = require('./modules/auth/formbarAuth')
const nativeAuth = require('./modules/auth/native');
const { AUTH } = require('sqlite3');
//using the oauth route
app.use('/', formbarAuthRoutes); // makes /auth/callback available
// local authentication route using native.js
app.post('/auth/local', (req, res) => {
    const { username, password } = req.body;

    // using authenticateUser
    nativeAuth.authenticateUser(username, password, (err, user) => {
        if (err) {
            console.error('Authentication error:', err)
            return res.status(500).send('Database error');
        }
        if (user) {
            // auth successful
            req.session.user = user;
            res.redirect('/');
        } else {
            // auth failed
            res.render('login', {
                session: req.session,
                AUTH_URL: process.env.AUTH_URL || 'http://formbeta.yorktechapps.com/oauth',
                loginError: true
            });
        }
    });
});

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