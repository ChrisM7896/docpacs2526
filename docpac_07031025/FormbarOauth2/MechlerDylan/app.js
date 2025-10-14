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

const db = new sqlite3.Database('./data/user.db', (err) => {
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
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
};

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index.ejs', {user : req.session.user})
    }
    catch (error) {
        res.send(error.message)
    }
});

app.get('/login', (req, res) => {
    if (req.query.token) {
		let tokenData = jwt.decode(req.query.token)
		req.session.token = tokenData
		req.session.user = tokenData.displayName
		res.redirect('/')
	} else {
		res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
	}
});

app.get('/profile', isAuthenticated, (req, res) => {
    var name = req.session.user
    db.get(`SELECT * FROM users WHERE fb_name = ?`, [name], (err, row) => {
        if (row) {
            res.render('profile.ejs', {user : req.session.user, check: JSON.stringify(row.profile_checked)})
        } else {
            db.run(`INSERT INTO users(fb_name, profile_checked) VALUES(?, ?)`, [name, null], function(err) {
                if (err) {
                    return console.error(err.message)
                }
                console.log(`Row(s) updated: ${this.changes}`)
                res.render('profile.ejs', {user : req.session.user, check: JSON.stringify(0)})
            })
        }
    })
});

app.post('/profile', (req, res) => {
    var name = req.session.user
    console.log(name)
    var check = req.body.userCheck
    console.log(check)
    db.run('UPDATE users SET profile_checked = ? WHERE fb_name = ?', [check, name], function (err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`Row(s) updated: ${this.changes}`);
            res.redirect('/profile');
        });
});

app.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});