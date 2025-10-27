// Imports
require('dotenv').config();
const express = require('express')
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database.')
    }
})
// Constants
const PORT = process.env.port || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'monkey';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth'
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`
const API_KEY = process.env.API_KEY || 'nutsonme'

// Middleware
app.set('view engine', 'ejs')
app.use(express.static('public'));
// app.use(express.json()):
// app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore ({ db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', {user: req.session.user})
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        //save user to database if not exists
        db.run('INSERT OR REPLACE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`)
        });
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');

});

app.get('/sendpogs', isAuthenticated, (req, res) => {
    const data = {
        from: 104,
        to: 114,
        amount: 2,
        pin: 404902,
        reason: 'test'
    };
    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
})

app

const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

socket.on('connect', () => {
    console.log('Connected');
    socket.emit('getActiveClass');
});

socket.on('setClass', (newClassId) => {
    console.log(`The user is currently in the class with id ${newClassId}`);
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
});