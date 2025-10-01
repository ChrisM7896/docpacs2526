//setup
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const path = require("path");
const session = require("express-session");
const jwt = require('jsonwebtoken');
const ejs = require("ejs");
const fs = require("fs");
const app = express()
const PORT = 3000;

const AUTH_URL = "https://formbeta.yorktechapps.com/";
const THIS_URL = "http://localhost:3000/login";

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new sqlite3.Database("./data/database.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.use(session({
    secret: 'secret_tunnel',
    resave: false,
    saveUninitialized: false,
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect(`/login`)
}

app.get('/', isAuthenticated, (req, res) => {
    res.render('index')
})

app.get('/login', isAuthenticated, (req, res) => {
    console.log(req.query.token)
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        req.session.userid = tokenData.id
        res.redirect('/')
        db.get('SELECT * FROM users WHERE fb_id = ?', [tokenData.id], (err, row) => {
            if (err) {
                console.error(err.message);
            }
            if (!row) {
                db.run('INSERT INTO users (fb_id, name, profile_checked) VALUES (?, ?, ?)', [tokenData.id, tokenData.displayName, 0], (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log(`A row has been inserted with fb_id ${tokenData.id}`);
                });
            } else {
                console.log("User already exists")
            }
        });

    } else {
        res.redirect(`${AUTH_URL}oauth?redirectURL=${THIS_URL}`)
    }
})
app.get('/profile', isAuthenticated, (req, res) => {
    try {
        res.render('profile', { user: req.session.user })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

app.post('/profile', (req, res) => {
    if (req.session.user) {
        db.run('UPDATE users SET profile_checked=? WHERE fb_id=?', [req.body.profile_checked, req.session.userid], (err) => {
            if (err) {
                console.error(err.message);
                res.status(500).send("Internal Server Error");
            }
            res.status(200).send("Profile updated.");
        });
    }
})

app.listen(3000)