//setup
const express = require("express");
const app = express()
const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const path = require("path");
const port = 3000
const MasterPassword = "ethan likes big black men, source: trust"

var db = new sqlite3.Database("./data/database.db");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');


//app gets
app.get('/', (req, res) => {
  res.render('index', { title: 'Home page' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Login Page' });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  db.all
});

app.get('/home', (req, res) => {
  res.render('home', { title: username });
});

app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up page' });
});









app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})