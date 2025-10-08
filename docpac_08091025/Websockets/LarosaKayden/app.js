//setup
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const session = require("express-session");
const jwt = require('jsonwebtoken');
const ejs = require("ejs");
const app = express()
const PORT = 3000;

const AUTH_URL = "https://formbeta.yorktechapps.com/";
const THIS_URL = "http://localhost:3000/chat";

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
    else res.redirect(`/`)
}

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index', { user: req.session.user })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

app.get('/chat', (req, res) => {
    if (req.session.user) return res.redirect('/')
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        req.session.userid = tokenData.id

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
                    return res.redirect('/')
                });
            } else {
                console.log("User already exists")
                return res.redirect('/')
            }
        });

    } else {
        res.redirect(`${AUTH_URL}oauth?redirectURL=${THIS_URL}`)
    }
})

app.listen(PORT, () => {
    console.log('Server is running on http://localhost:3000');
});