const jwt = require('jsonwebtoken');
const path = require('path');
const { Server } = require('socket.io');
const session = require('express-session');
const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.use(session({
    secret: 'funny string right here',
    resave: false,
    saveUninitialized: true
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index', { user: req.session.user });
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/login', (req, res) => {
    console.log(req.query.token)
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        req.session.id = tokenData.id
        res.redirect('/chat')
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
})

app.get('/chat', isAuthenticated, (req, res) => {
    try {
        res.render('chat', { user: req.session.user });
    } catch (error) {
        res.send(error.message);
    }
});
