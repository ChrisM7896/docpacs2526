//requirements and setup
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

 
//express setup
app.set('view engine', 'ejs');
app.use(express.static('public'));
//app.use(express.json());
 
//from env
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SECRET_KEY || "ggggghhhhhh";
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420';
const THIS_URL = process.env.THIS_URL || 'http://localhost:3000/login';
const API_KEY = process.env.API_KEY || 'your_api_key_here';
 
//database
const db = new sqlite3.Database('./db/app.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});
 
//session
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.db',
        dir: './db'
    }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
 
function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};
 
//routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});
 
app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
 
        //save user into database if not exist
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} added to database`);
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
        from: 121,
        to: 51,
        amount: 2,
        pin: 1234,
        reason: 'Test'
    };

    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
});

//sockets
const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});
 
socket.on('connect', () => {
    console.log('Connected to auth server');
    socket.emit('getActiveClass')
});
 
socket.on('disconnect', () => {
    console.log('Disconnected to auth server');
});
 
socket.on('setClass', (classData) => {
    console.log('Recieved class data:', classData);
    //
});
 
//listening
app.listen(process.env.PORT, () => {
    console.log(`Serever is running at http://localhost:${PORT}`);
});