const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const { get } = require('http');
const { read } = require('package');
const { text } = require('stream/consumers');
const { error } = require('console');
const app = express();
const port = 3000;
const SECRET_KEY = 'your_secret_key_here';
const db = new sqlite3.Database('users.db');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
        db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashedPassword], (err, row) => {
            if (err) {
                res.redirect('/error');
            }
            if (row) {
                res.redirect(`/home?user=${username}&email=${row.email}`);
            } else {
                res.redirect('/error');
            }
        }); 
    }
    catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});
app.post('/signup', (req, res) => {
    try {
        const { username, password, email } = req.body;
        const hashedPassword = crypto.createHmac('sha256', SECRET_KEY).update(password).digest('hex');
        db.run('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [username, hashedPassword, email], function(err) {
            if (err) {
                console.log(err);
                res.redirect('/error');
            }
            else {
                res.redirect('/home');
            }

        });
    } catch (error) {
        res.status(500).send('Internal Server Error');
    }
});

app.get('/error', (req, res) => {
    res.status(500).render('error', { message: 'An error occurred' });
});
    
app.get('/home', (req, res) => {
    const user = req.query.user;
    const email = req.query.email;
    res.render('home', { user, email });
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
        email TEXT UNIQUE
    )`);
});