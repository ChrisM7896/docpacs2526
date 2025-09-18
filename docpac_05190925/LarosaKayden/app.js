//setup
const express = require("express");
const app = express()
const sqlite3 = require('sqlite3').verbose();
const path = require("path");
const port = 3000

//middle men
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

//database
const db = new sqlite3.Database("./scores.db");

//app.gets
app.get('/', (req, res) => {
  res.render('index', { title: 'Home page' });
});

app.get('/highscores', (req, res) => {
  res.render('highscores', { title: 'High Scores' });
});

app.get('/game', (req, res) => {
  res.render('game');
});

app.get('/error', (req, res) => {
  res.render('error', { title: 'uh-oh' });
});

//other
app.post('/submitScore', (req, res) => {
  req.body
  });

app.listen(port)