const { name } = require('ejs');
const express = require('express');
const requestIp = require('request-ip');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dataHold.db', (err) => {
  console.log('Connected to the SQLite database.');
});
const app = express();
const fs = require('fs');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
app.use(requestIp.mw());
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.set('view engine', 'ejs');
app.get("/", (req, res) => {
  res.render("index");
});
app.get("/game", (req, res) => {
    res.render("game");
});
app.post("/game", (req, res) => {
  console.log(req.body);
  let databloc = {ip: req.hostname , score: req.body.score , name: req.body.name};
  let sql = `INSERT INTO scores(ip, score, name) VALUES(?,?,?)`;
  db.run(sql, [databloc.ip, databloc.score, databloc.name], function(err) {
    if (err) {
      return console.log(err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);
  db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Closed the database connection.');
  });
  });
});
app.get("/hiscores", (req, res) => {
    let sql = `SELECT * FROM scores ORDER BY score DESC LIMIT 10`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.render("hiscores", {scores: rows}); //if you want to see high scores than go to highscores before game not after.
  });
app.post("/hiscores", (req, res) => {
  //functionality was put in /game post before i got to this step apologies
  });
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});;