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
const db = new sqlite3.Database("./data/database.db");

//app.gets
app.get('/', (req, res) => {
  res.render('index', { title: 'Home page' });
});

app.get('/highscores', (req, res) => {
  // After inserting, fetch top 10 highscores
  db.all("SELECT name, score FROM scores ORDER BY score DESC LIMIT 10", (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).render("error", { title: "uh-oh" });
    }
    res.render('highscores', { title: 'Highscores', highscores: JSON.stringify(rows) });
  });
});

app.get('/game', (req, res) => {
  res.render('game');
});

app.get('/error', (req, res) => {
  res.render('error', { title: 'uh-oh' });
});

//other
app.post('/submitScore', (req, res) => {
  const { username, score } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Insert the new score
  db.run(
    "INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)",
    [username, score, ip],
    function (err) {
      if (err) {
        console.error(err.message);
        return res.status(500).render("error", { title: "uh-oh" });
      }
    }
  );
});

app.listen(port)