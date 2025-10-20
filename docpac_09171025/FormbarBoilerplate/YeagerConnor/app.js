//Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLLiteStore = require('connect-sqlite3')(session);

//Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        console.log('Database connected successfully');
    }
});

//Constants
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';


//Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new SQLLiteStore({db: 'sessions.db', dir: './db'}),
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
     if (req.session.user) next()
     else res.redirect('/login')
};

//Routes
app.get('/', isAuthenticated,(req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
     if (req.query.token) {
          let tokenData = jwt.decode(req.query.token);
          req.session.token = tokenData;
          req.session.user = tokenData.displayName;

          db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function(err) {
               if (err) {
                    return console.log(err.message);
               }
               console.log(`User ${tokenData.displayName} added to database.`);
          });

          res.redirect('/');

     } else {
        console.log(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
          res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
     };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

app.get('/sendPogs', isAuthenticated, (req, res) => {
    const data = {
        from: 89,
        to: 109,
        amount: 2,
        pin: 69420,
        reason: 'test pog answer'
    };

    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
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
    console.log('Received class data:', classData);
    // Handle class data as needed
});

//Start Server
app.listen(PORT, () => {
    console.log(`Server is running at port http://localhost:${PORT}`);
});