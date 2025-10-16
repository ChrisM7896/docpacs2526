const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const e = require('express');
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
        res.redirect('/profile')
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
})

app.get('/profile', isAuthenticated, (req, res) => {
    if (req.session.token) {
        db.get('SELECT * FROM users WHERE fb_name = ?', [req.session.user], (err, row) => {
            if (err) {
                return console.error(err.message);
            }
            if (!row) {
                db.run('INSERT INTO users(fb_name, profile_checked) VALUES(?, ?)', [req.session.user, 0], function (err) {
                    if (err) {
                        return console.error(err.message);
                    }
                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                    res.render('profile', { user: req.session.token, check: JSON.stringify(0) });
                });
            } else {
                res.render('profile', { user: req.session.token, check: JSON.stringify(row) });
            }
        });
    } else {
        res.send(error.message);
    }
});

app.post('/profile', isAuthenticated, (req, res) => {
    if (req.session.token) {
        db.run('UPDATE users SET profile_checked = ? WHERE fb_name = ?', [req.body.check, req.session.user], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Row(s) updated: ${this.changes}`);
            res.redirect('/profile');
        });
    }
});