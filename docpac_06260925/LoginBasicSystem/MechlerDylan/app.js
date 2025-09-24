const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto')
const key = "dghibl29dsfy7hjs68^e5$673gdh&^tu47" //34 characters
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/userinfo.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password || username === "" || password === "") {
            throw new Error("Username or password missing");
        }
        crypto.pbkdf2(password, key, 1000, 64, `sha512`, (err, derivedKey) => {
            if (err) throw err;
            const hashedPassword = derivedKey.toString(`hex`);
            db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, hashedPassword], (err, row) => {
                if (err) {
                    throw err;
                }
                if (row) {
                    res.redirect("home?user=" + username + "&email=" + row.email);
                } else {
                    res.redirect('/error');
                }
            });
        });
    } catch (error) {
        res.redirect('/error');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

app.post('/signup', (req, res) => {
    try {
        var username = req.body.username;
        var password = req.body.password;
        var email = req.body.email;
        if (!username || !password || username === "" || password === "" || !email || email === "") {
            throw new Error("Username or password missing");
        }
        crypto.pbkdf2(req.body.password, key, 1000, 64, `sha512`, (err, derivedKey) => {
            if (err) throw err;
            password = derivedKey.toString(`hex`);
            db.run(`INSERT INTO users(username, password, email) VALUES(?, ?, ?)`, [username, password, email], function(err) {
                try {
                    if (err) {
                        console.log(err.message);
                        throw new Error("Database insertion error");
                }
                    console.log(`A row has been inserted with rowid ${this.lastID}`);
                    res.redirect('/login');
                } catch (error) {
                    res.redirect('/error');
                }
            });
        });
    } catch (error) {
        res.redirect('/error');
    }
});

app.get('/error', (req, res) => {
    res.render('error.ejs');
});

app.get('/home', (req, res) => {
    res.render('home.ejs', {
        username: req.query.user,
        email: req.query.email
    });
});

app.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});