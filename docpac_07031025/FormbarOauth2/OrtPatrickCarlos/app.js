const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const AUTH_URL = 'https://formbeta.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/login';
const API_KEY = 'b36e1d08c24b6d14486cc949a96ef3d005747ff688c279dc4e0e313d0c602db5';

const db = new sqlite3.Database('./db.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to SQLite database');
    }
});

app.use(express.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
    session({
        secret: 'venture',
        resave: false,
        saveUninitialized: true,
    })
);

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/profile');
        return;
    }
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);

        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        req.session.fb_id = tokenData.id;
        console.log(tokenData.id);

        db.get("SELECT * FROM users WHERE fb_id = ?", [tokenData.id], (err, row) => {
            if (err) {
                console.error('Error inserting user', err);
            }
            if (!row) {
                db.run(
                    "INSERT INTO users (fb_id, fb_name, profile_checked) VALUES (?, ?, ?)",
                    [tokenData.id, tokenData.displayName, 0],
                    (err) => {
                        if (err) {
                            console.error('Error inserting user', err);
                        }
                        res.redirect('/profile');
                    }
                );
            } else {
                res.redirect('/profile');
            }
        });
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/profile', isAuthenticated, (req, res) => {
    db.get(
        'SELECT fb_name, profile_checked FROM users WHERE fb_name = ?',
        [req.session.user],
        (err, row) => {
            if (err) {
                console.error('Error fetching user data:', err);
                res.render('profile', { user: { user: req.session.user }, profile_checked: null });
            } else {
                console.log('User data:', row); // Log the user data for debugging
                res.render('profile', {
                    user: { user: row ? row.fb_name : req.session.user },
                    profile_checked: row ? row.profile_checked : 0,
                });
            }
        }
    );
});

app.post('/profile', isAuthenticated, (req, res) => {
    // Check if the checkbox is checked (value will be 'on' if checked, undefined if not)
    let profileChecked = req.body.profile_checked === 'on';

    db.run(
        "UPDATE users SET profile_checked = ? WHERE fb_id = ?;",
        [profileChecked ? 1 : 0, req.session.fb_id],
        (err) => {
            if (err) {
                console.error('Error updating profile_checked:', err);
                res.render('error');
                return;
            }
            res.redirect('/profile');
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});