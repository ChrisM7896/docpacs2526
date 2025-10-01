const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session')
//add encryption if necessary
const app = express();
const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/templatedatabase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.set('view engine', 'ejs');

app.use(session({
    secret: 'secretString',
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index.ejs', {user : req.session.user})
    }
    catch (error) {
        res.send(error.message)
    }
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        const tokenData = req.session.token;
        try {
            const currentTime = Math.floor(Date.now() / 1000);
            if (tokenData.exp < currentTime) {
                throw new Error('Token has expired');
            }
            next();
        } catch (err) {
            res.redirect(`${AUTH_URL}/oauth?refreshToken=${tokenData.refreshToken}&redirectURL=${THIS_URL}`);
        }
    } else {
        res.redirect(`/login?redirectURL=${THIS_URL}`)
    }
}

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect('/');
    } else {
        res.redirect(`${AUTH_URL}?redirectURL=${THIS_URL}`);
    };
});

app.get('/profile', isAuthenticated, (req, res) => {
    res.render('profile.ejs', {user : req.session.user})
})

app.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});