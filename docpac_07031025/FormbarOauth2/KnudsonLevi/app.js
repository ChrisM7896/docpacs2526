const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
app = express();
path = require('path');

const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'

const sessionOptions = {
    secret: "It's a secret",
    resave: false,
    saveUninitialized: false,
}

app.use(session(sessionOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
//Initialize database
dbfile = path.join(__dirname, 'box.db');
db = new sqlite3.Database(dbfile, (err) => {
    if (err) {
        console.error(err.message);
    }
});
//Check value of checkbox for user or add user if not in database
function checkCheckbox(id, name) {
    return new Promise((resolve, reject) => {
        db.get('SELECT profile_checked FROM users WHERE fb_id = ?', [id], (err, row) => {
            if (err) {
                console.error(err.message);
                return reject(err);
            }
            if (row === undefined) {
                addUser(id, name, false);
                console.log(`User ${name} not found in database. Adding user with checkbox value: false`);
                return resolve(false);
            } else {
                return resolve(row.profile_checked ? true : false);
            }
        });
    });
}
//Update checkbox value for user
function boxChecker(id, boxChecked) {
    db.run('UPDATE users SET profile_checked = ? WHERE fb_id = ?', [boxChecked ? 1 : 0, id], function(err) {
        if (err) {
            console.error(err.message);
            return reject(err);
        }
        console.log(`User with id ${id} updated to checkbox value: ${boxChecked}`);
    });
}
//Add new user to database
function addUser(id, displayName, boxChecked) {
    db.run('INSERT INTO users (fb_id, fb_name, profile_checked) VALUES (?, ?, ?)', [id, displayName, boxChecked ? 1 : 0], function(err) {
        if (err) {
            console.error(err.message);
            return reject(err);
        }
    });
}
//Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}
//Home page
app.get('/' , isAuthenticated, (req, res) => {
    res.render('index.ejs');
});
//Profile page
app.get('/profile', isAuthenticated, async (req, res) => {   
    req.session.boxChecked = await checkCheckbox(req.session.fb_id, req.session.user);
    res.render('profile.ejs', {user: req.session.user, boxChecked: req.session.boxChecked});
});
//Profile form submission
app.post('/profile', isAuthenticated, (req, res) => {   
    req.session.boxChecked = req.body.checkbox === 'boxChecked' ? true : false;
    boxChecker(req.session.fb_id, req.session.boxChecked);
    res.redirect('/profile');
});
//Login route
app.get('/login', async (req, res) => {
    if (req.session.user) { //If user is already logged in, redirect to profile
        res.redirect('/profile');
    } else if (req.query.token) { //If token is present in query, decode it and set session variables
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        req.session.fb_id = tokenData.id;
        console.log(`User ${tokenData.displayName} logged in with id ${tokenData.id}`);
        req.session.boxChecked = await checkCheckbox(tokenData.id, tokenData.displayName);
        res.redirect('/profile');
    } else { //If no token, redirect to auth server
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.listen(3000, () => {console.log('Server started at http://localhost:3000');});