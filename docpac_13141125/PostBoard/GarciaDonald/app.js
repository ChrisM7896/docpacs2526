// Imports
require('dotenv').config();
const express = require('express')
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const react = require('react');
const http = require('http');
const server = http.createServer(app);
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
const SESSION_SECRET = process.env.SESSION_SECRET || 'employment';
const AUTH_URL = process.env.AUTH_URL || 'https://formbeta.yorktechapps.com/oauth'
const THIS_URL = process.env.THIS_URL || 'http://172.16.3.179:3000/login'
const API_KEY = process.env.API_KEY || 'craigslist'

// Middleware
app.set('view engine', 'ejs')
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore ({ db: 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('http://172.16.3.179:3000/login')
};

// Routes
app.get('/index', isAuthenticated, (req, res) => {
    try {
        console.log(`User ${req.session.user} accessed the home page.`);
    } catch (error) {
        console.error('Error accessing session data:', error);
    }
});

app.get('/login', (req, res) => {
    // debugging to see what i'm receiving
    console.log('Query Parameters:', req.query);
    console.log('Request body:', req.body);
    console.log('Full URL:', req.url);

    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        console.log(`User ${tokenData.displayName} logged in.`);

        //save user to database if not exists
        db.run('INSERT OR REPLACE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`)
        });
        res.redirect('/index');
    } else {
        console.log('No token found, redirecting to auth server.', THIS_URL);
        res.redirect(`${AUTH_URL}/?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');

});
app.get('/theboard', isAuthenticated, (req, res) => {
    db.all('SELECT * FROM jobs', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.render('theboard', { jobs: rows });
        }
    });
});
app.get('/postjob', isAuthenticated, (req, res) => {
    const title = req.query.title;
    const description = req.query.description;
    const postedBy = req.session.user;
    db.run('INSERT INTO jobs (title, description, postedBy) VALUES (?, ?, ?)', [title, description, postedBy], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/theboard');
        }
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server is running at http://172.16.3.179:${PORT}`);
});