const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const crypto = require('crypto');
const app = express();
const SECRET_KEY = 'I_WANT_YURI';
const db = new sqlite3.Database('./data/data.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/error', (req, res) => {
    res.render('error');
});

app.get('/signup', (req, res) => {
    res.render('signup');
});

app.get('/home', (req, res) => {
    res.render('home', { user: req.query.user, email: req.query.email });
});

app.post('/login', (req, res) => {
    try {
        const { username, password} = req.body;
        if (username == '' || password == '') {
            res.redirect('/error');
            throw new Error('Username and password are required');
        }
        crypto.scrypt(password, SECRET_KEY, 32, (err, derivedKey) => {
            if (err) {
                console.error('Error encrypting password', err);
                res.redirect('/error');
                return;
            }
            const encryptedPassword = derivedKey.toString('hex');
            db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword], (err, row) => {
                if (err) {
                    console.error('Error querying database', err);
                    res.redirect('/error');
                    return;
                }
                if (row) {
                    res.redirect(`/home?user=${row.username}&email=${row.email}`);
                } else {
                    res.redirect('/error');
                }
                });

            
            })
        } catch (err) {
            res.redirect('/error');
        }
    });


app.post('/signup', (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input
        if (!username || !password || !email) {
            res.redirect('/error');
            throw new Error('Username, password, and email are required');
        }

        // Check if the user already exists
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
            if (err) {
                console.error('Error querying database', err);
                res.redirect('/error');
            } else if (row) {
                // User already exists
                res.redirect('/error');
            } else {
                // Hash the password using crypto.scrypt
                crypto.scrypt(password, SECRET_KEY, 32, (err, derivedKey) => {
                    if (err) {
                        console.error('Error encrypting password', err);
                        res.redirect('/error');
                        return;
                    }

                    const encryptedPassword = derivedKey.toString('hex');

                    // Insert the new user into the database
                    db.run(
                        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                        [username, encryptedPassword, email],
                        (err) => {
                            if (err) {
                                console.error('Error inserting data', err);
                                res.redirect('/error');
                            } else {
                                res.redirect('/login');
                            }
                        }
                    );
                });
            }
        });
    } catch (err) {
        console.error(err);
        res.redirect('/error');
    }
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});