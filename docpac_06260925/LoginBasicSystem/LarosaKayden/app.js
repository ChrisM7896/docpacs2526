//setup
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const app = express()
const port = 3000
const MasterPassword = "ethan likes big black men source trust"
var db = new sqlite3.Database("./data/database.db");

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//encryption functions

const Key = crypto.createHash('sha256').update(MasterPassword).digest();
function encrypt(password, key) {
  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv('aes-256-cbc', Key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex') + cipher.final('hex');
  // Return IV and encrypted data 
  //need fix
  return { iv: iv.toString('hex'), encrypted: encrypted };
}

function decrypt(password, key) {
  const iv = Buffer.from(crypto.randomBytes(16));
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(password, 'utf8', 'hex') + decipher.final('hex');
  //need fix
  return decrypted + decipher.final('hex');
}

//app gets
app.get('/', (req, res) => {
  res.render('index', { title: 'Home page' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Page' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ? AND password = ?", [username, password], (err, user) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
    if (!user) {
      res.redirect('/error', { title: 'Error', message: 'Invalid username or password' });
    }
    if (!user.password) {
      res.redirect('/error', { title: 'Error', message: 'Invalid username or password' });
    }
    const hash = crypto.createHmac('sha256', MasterPassword)
      .update(password)
      .digest('hex');
    if (hash === user.password) {
      res.redirect('/home');
    } else {
      res.status(401).send("Invalid username or password");
    }
  });
});

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up page' });
});

app.post('/signup', (req, res) => {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;

  if (!username || !email || !password) {
    res.render('error', { title: 'Error', message: 'you didn\'t fill out all fields' });
  }
});

app.get('/error', (req, res) => {
  res.render('error', { title: 'Error' });
});

app.get('/home', (req, res) => {
  res.render('home');
});

app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})