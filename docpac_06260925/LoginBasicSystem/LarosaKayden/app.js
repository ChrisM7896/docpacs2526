//setup
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require("path");
const ejs = require("ejs");
const fs = require("fs");
const session = require('express-session');
const app = express()
const port = 3000
const MasterPassword = "ethan likes big black men source trust"
let db = new sqlite3.Database("./data/database.db", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//extra stuff
app.use(session({
  secret: MasterPassword,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, maxAge: 1000 * 15}
}));

//app gets
app.get('/', (req, res) => {
  res.render('index', { title: 'Home page' });
});

//login
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Page' });
});

app.post('/login', (req, res) => {
  try {
    let username = req.body.username
    let password = req.body.password

    crypto.pbkdf2(password, MasterPassword, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        console.error(err.message);
        return res.status(500).render("error", { title: "Error", message: "Critical Server Error" });
      }
      password = derivedKey.toString('hex');
      db.get("SELECT * FROM database WHERE username = ? AND password = ?", [username, password], (err, row) => {
        if (!row) {
          return res.render("error", { title: "Error", message: "Invalid username or password" });
        }
        if (err) {
          console.error(err);
          res.render('error', { title: 'Error', message: 'Critical Server Error' });
        }
        else {
          req.session.user = row.username;
          req.session.email = row.email;
          res.redirect("/home");
        }
      });
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).render("error", { title: "Error", message: "An unexpected error occurred" });
  }
});

//signup
app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up page' });
});

app.post('/signup', (req, res) => {
  try {
    let username = req.body.username
    let email = req.body.email
    let password = req.body.password

    // Hash password with crypto.pbkdf2
    crypto.pbkdf2(password, MasterPassword, 1000, 64, 'sha512', (err, derivedKey) => {
      if (err) {
        console.error(err.message);
        return res.status(500).render("error", { title: "Error", message: "Critical Server Error" });
      }
      password = derivedKey.toString('hex');

      // Insert the user into the database
      db.run("INSERT INTO database (username, email, password) VALUES (?, ?, ?)", [username, email, password],
        function (err) {
          if (err) {
            console.error(err.message + " with query: INSERT INTO database (username, email, password) VALUES (" + username + ", " + email + ", ? )");
            if (err.message.includes("UNIQUE constraint failed")) {
              return res.status(400).render("error", { title: "Error", message: "Username or email already exists. Please try a different one." });
            }
            else {
              return res.status(500).render("error", { title: "Error", message: "Could not create user" });
            }
          }
          res.redirect('/login');
        }
      );
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).render("error", { title: "Error", message: "An unexpected error occurred" });
  }
});

app.get('/error', (req, res) => {
  res.render('error', { title: 'Error' });
});

app.get('/home', (req, res) => {
  if (!req.session.user || !req.session.email) {
    return res.redirect('/login');
  }
  res.render('home', { title: 'Home', user: req.session.user, email: req.session.email });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { title: "Error", message: "Could not log out. Please try again." });
    }
    res.redirect('/login');
  });
});

app.use(express.static(path.join(__dirname, 'public')));

app.get(/^\/.*$/, (req, res) => {
  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})