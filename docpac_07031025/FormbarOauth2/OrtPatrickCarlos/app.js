const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const AUTH_URL = 'https://formbeta.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/login'

const db = new sqlite3.Database('./db.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

app.use(session({
    secret: 'venture',
    resave: false,
    saveUninitialized: true,
}));

function isAuthenticated(req, res, next) {
    console.log('Session:', req.session);
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    console.log('Query token:', req.query.token);

    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        console.log('Decoded token:', tokenData);

        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        req.session.save(() => {
            res.redirect('/profile');
        });
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile', { user: req.session.user });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});