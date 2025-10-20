require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to database');
    }
})

const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key'
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth'
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`
const API_KEY = process.env.API_KEY || 'your_api_key'

app.set("view engine", "ejs");
app.use(express.static('public'));

app.use(session({
    store: new SQLiteStore({db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user});
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database`);
        });

        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login')
});

app.get('/sendpogs', isAuthenticated, (req, res) => {
    const data = {
        from: 111,
        to: 106,
        amount: 2,
        pin: 2809,
        reason: 'Test pog transfer'
    }
    socket.emit('transferDigipogs', data)
    res.send('Pogs Sent!');
});

const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

socket.on('connect', () => {
    console.log('Connected to auth server');
    socket.emit('getActiveClass');
});

socket.on('disconnect', () => {
    console.log('Disconnected from auth server');
});

socket.on('setClass', (classData) => {
    console.log('Recieved class data:', classData);
    //Handle class data as needed
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});