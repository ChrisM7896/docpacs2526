const express = require('express');
const app = express();
const SECRET_KEY = 'a-long-random-string';
const crypto = require('crypto');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/app.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);  // exit process if db connection fails
    }
    console.log('Connected to the database.');
});

// Start server only after table is ready
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));

// home page
app.get('/', (req, res) => {
    res.render('index');
});

//login page
app.get('/login', (req, res) => {
    res.render('login');
});


// login page form submission
app.post('/login', (req, res) => {
    try {
    const { username, password } = req.body;
    res.locals.user = req.body.username;
    crypto.scrypt(password, SECRET_KEY, 32, (err, derivedKey) => {
        if (err) {
            console.error('Password hashing error:', err.message);
            res.redirect('/error');
        }
    const hashedPassword = derivedKey.toString('hex');
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, hashedPassword], (err, row) => {
        if (err) {
            console.error('Database query error:', err.message);
            res.redirect('/error');
        }
        if (row) {
            res.render('home', { user: res.locals.user, email: row.email });
        }
        });
    });
} catch (error) { 
    console.error('Unexpected error:', error.message);
    res.redirect('/error');
}
});

//sign up page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// home page after login/signup
app.get('/home', (req, res) => {
    res.render('home', { user: res.locals.user, email: res.locals.email });
});

// handle sign up form submission  
app.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    res.locals.user = req.body.username;
    res.locals.email = req.body.email;
    crypto.scrypt(password, SECRET_KEY, 32, (err, derivedKey) => {
        if (err) {
            console.error('Password hashing error:', err.message);
            res.redirect('/error');
        }
        const hashedPassword = derivedKey.toString('hex');
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function(err) {
            if (err) {
                console.error('Database insertion error:', err.message);
                res.redirect('/error');
            } else {
                res.render('home', { user: res.locals.user, email: res.locals.email } );
            }
        });
    });
});

//error page
app.get('/error', (req, res) => {
    res.render('error');
});