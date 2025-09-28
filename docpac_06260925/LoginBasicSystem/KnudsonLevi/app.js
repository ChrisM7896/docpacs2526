const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require('path');
const app = express();
app.set('view engine', 'ejs');

//encryption setup
const SECRET_KEY = '1fa6324686c940ee5e57db96d1df433e58cd0dad4e1367d0d14928188c9552b9';

//database setup
const dbFile = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});
function createUser(username, email, password) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function(err) {
            if (err) {
                console.error(err.message);
                return reject(err);
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
            resolve(this.lastID);
        });
    });
}
//encryption function
function encrypt(password) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(SECRET_KEY, 'hex'), Buffer.from(SECRET_KEY.slice(0, 32), 'hex'));
    let encryptedPassword = cipher.update(password, 'utf8', 'hex');
    encryptedPassword += cipher.final('hex');
    return encryptedPassword;
}
//static files setup
app.use(express.static(path.join(__dirname, 'public')));
//get endpoint for the root of the app
app.get('/', (req, res) => {
    res.render('index.ejs');
});
//get endpoint for the login page
app.get('/login', (req, res) => {
    const username = req.query.username || '';;
    res.render('login.ejs', {username: username});
});
//get endpoint for the signup page
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});
app.get('/home', (req, res) => {
    const username = req.query.username || 'Guest';
    const email = req.query.email || 'Not provided';
    res.render('home', {username: username, email: email});
});
app.get('/error', (req, res) => {
    const error = req.query.error || 'An unknown error occurred.';
    res.render('error', {error: error});
});
//POST endpoint for the login page
app.post('/login', express.urlencoded({extended: true}), async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let error = null;
    if (!username || !password) {
        error = "Username and Password are required.";
    } else {
        const encryptedPassword = encrypt(password);
        //get user from database
        db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, encryptedPassword], (err, row) => {
            if (err) {
                console.error(err.message);
                error = "Internal server error.";
                res.render('error', {error: error});
            } else if (!row) {
                error = "Invalid username or password.";
                res.render('error', {error: error});
            } else {
                res.redirect(`/home?username=${row.username}&email=${row.email}`);
            }
        });
    }
    if (error) {
        res.render('error', {error: error});
    }
});
//POST endpoint for the signup page
app.post('/signup', express.urlencoded({extended: true}), async (req, res) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()\-_+=\{\}\[\]<>,.:;]{5,20}$/;
    const usernamePattern = /^[a-zA-Z0-9 ]{3,20}$/;
    const username = req.body.username;
    const email = req.body.email.toLowerCase();
    const password = req.body.password;
    let error = null;
    if (!email || !password || !username) {
        error = "Username, Email, and Password are required.";
    } else if (!usernamePattern.test(username)) {
        error = "Invalid username.";
    } else if (!emailPattern.test(email)) {
        error = "Invalid email.";
    } else if (!passwordPattern.test(password)) {
        error = "Password must be 5-20 characters and can include letters, numbers, and special characters.";
    } else {
        console.log(`Received: Username - ${username} Email - ${email} from ${req.ip}`);
        const encryptedPassword = encrypt(password);
        try {
            const insertedId = await createUser(username, email, encryptedPassword);
            console.log('Inserted user id:', insertedId);
        } catch (dbErr) {
            error = 'An account with this email or username may already exist. Please try again.';
        }
    }
    if (error) {
        res.redirect(`/error?error=${encodeURIComponent(error)}`);
    } else {
        res.redirect('/login?username=' + encodeURIComponent(username) + '&email=' + encodeURIComponent(email));
    }
});
//start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});