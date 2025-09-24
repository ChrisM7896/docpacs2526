const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const port = 3000;
const app = express();
const SECRET_KEY = 'venture';
const crypto = require('crypto');
const db = new sqlite3.Database('./app.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, email TEXT, password TEXT)');
        console.log('Connected to SQLite database');
    }
});



app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    try {
        const { username, password } = req.body;
        if (username === '' || password === '') {
            throw new Error('Empty username or password');
        }
        crypto.scrypt(password, SECRET_KEY, 32, (err, derivedKey) => {
            if (err) throw err;
            const hashedPassword = derivedKey.toString('hex');
            db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashedPassword], (err, row) => {
                if (err) throw err;
                if (row) {
                    // Redirect to /home with username and email as query parameters
                    res.redirect(`/home?user=${encodeURIComponent(row.username)}&email=${encodeURIComponent(row.email)}`);
                } else {
                    res.redirect('/error?message=Invalid username or password');
                }
            });
        });
    } catch (error) {
        res.redirect('/error');
    }
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.post('/signup', (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (username === '' || email === '' || password === '') {
            throw new Error('Empty username, email or password');
        }
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) throw err;
            if (row) {
                return res.redirect('/error?message=User already exists');
            }
            crypto.scrypt(password, SECRET_KEY, 32, (err, derivedKey) => {
                if (err) throw err;
                const hashedPassword = derivedKey.toString('hex');
                db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function(err) {
                    if (err) throw err;
                    res.redirect(`/login`);
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.redirect('/error');
    }
});

app.get('/error', (req, res) => {
    res.render('error');
});

app.get('/home', (req, res) => {
    const { user, email } = req.query;
    res.render('home', { user: { username: user, email: email } });
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
    });