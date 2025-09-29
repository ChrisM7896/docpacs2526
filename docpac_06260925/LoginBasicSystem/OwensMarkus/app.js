const { name } = require('ejs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./userdata.db', (err) => {
  console.log('Connected to the SQLite database.');
});
const app = express();
const fs = require('fs');
const crypto = require('crypto');
const SECRET_KEY = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz";
const algorithm = 'aes-256-cbc';
const iv = "Iamsixteenbitsiv"
const key = crypto.createHash('sha256').update(SECRET_KEY).digest();
app.use(express.urlencoded({extended: false})); 
app.use(express.json());
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/login', (req, res) => {
  res.render('login');
});
function encrypt(text) {
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return { iv: iv.toString('hex'), encryptedData: encrypted };
}
app.post('/login', (req, res) => {
    username = req.body.usernamelo
    password = req.body.passwordlo
    console.log(req.body.usernamelo);
    console.log(req.body.passwordlo);
    try {
        let tbencryptlo = req.body.passwordlo;
        let encrypteddata = encrypt(tbencryptlo);
        console.log(encrypteddata.encryptedData);
        encryptpassword = encrypteddata.encryptedData;
        db.get(`SELECT * FROM users WHERE username = ? AND password = ?`, [username, encryptpassword], (err, row) => {
            if (err) {
                res.redirect('/error');
                return;
            }
            if (row) {
                console.log(row);
                res.redirect(`/home?user=${encodeURIComponent(row.username)}&email=${encodeURIComponent(row.email)}`);
            } else {
                res.redirect('/error');
                return;
            }
        });
    } catch (error) {
        res.redirect('/error');
        return console.log(error.message);
    }
});
app.get('/signup', (req, res) => {
  res.render('signup');
});
app.post('/signup', (req, res) => {
    try {
        if (req.body.passwordsu !== undefined && req.body.usernamesu !== undefined && req.body.emailsu !== undefined) {
            username = req.body.usernamesu
        password = req.body.passwordsu
        console.log(req.body.usernamesu);
        console.log(req.body.passwordsu);
            let tbencryptsu = req.body.passwordsu;
            let encrypteddata = encrypt(tbencryptsu);
            console.log(encrypteddata.encryptedData);
            encryptpassword = encrypteddata.encryptedData;
            db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [req.body.usernamesu, req.body.emailsu, encryptpassword], function(err) {
                if (err) {
                    res.redirect('/error');
                }
                console.log(`A row has been inserted with rowid ${this.lastID}`);
            });
            res.redirect('/login');
        }
    } catch (error) {
        res.redirect('/error');
        return console.log(error.message);

    }
});
app.get('/error', (req, res) => {
    res.render('error');
    });
app.get('/home', (req, res) => {
    console.log(req.query.user)
    console.log(req.query.email)
    usernamefinald=req.query.user
    emailfinald=req.query.email
    res.render('home', {usernamefinal: usernamefinald, emailfinal: emailfinald});

});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});;