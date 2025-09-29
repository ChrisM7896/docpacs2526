const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./data/app.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const SecretKey = 'special_key_no_touchie';

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        throw new Error('Username and password are required');
    }
    try {
        const hash = crypto.createHash('sHA256', SecretKey);
        const encryptedPassword = hash;
        db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword], (err, row) => {
            if (err) {
                throw err;
            }
            res.redirect('/home?user=' + row.username + '&email=' + row.email);
        });
    }
    catch (error) {
        res.render('error.ejs');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});

app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
    }
    try {
        const hash = crypto.createHash('sHA256', SecretKey);
        const encryptedPassword = hash;
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, encryptedPassword], function (err) {
            try {
                if (err) {
                    throw err;
                }
                res.redirect('/login');
            }
            catch (error) {
                res.render('error.ejs');
            }
        });
    }
    catch (error) {
        console.error(error);
        res.render('error.ejs');
    }
});

app.get('/error', (req, res) => {
    res.render('error.ejs');
});

app.get('/home', (req, res) => {
    const { user, email } = req.query;
    res.render('home.ejs', { user, email });
});
