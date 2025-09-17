const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const { get } = require('http');
const app = express();
const sqlite3 = require('sqlite3').verbose();
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const dbFile = path.join(__dirname, 'highscores.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the highscores database.');
});
//Retrieve highscore from database
function getHighscore(name, ip) {
    db.get('SELECT score FROM scores WHERE name = ? AND ip = ? ORDER BY score DESC LIMIT 1', [name, ip], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        return row
    });
}
//Save highscores to database
function saveScore(score, name, ip) {
    db.run('INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)', [name, score, ip], function(err) {
        if (err) {
            return console.error(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
}
//Get request for root of the app
app.use(express.static('public'));
app.get("/", function (req, res) {
    //console.log("Highscore for " + req.ip + ": " + highscores[req.ip]);
    // Sending index.html to the browser
    res.render('index.ejs');
});
// Get request for the game
app.get("/game", function (req, res) {
    res.render('buttonMasher.ejs');
});
//Get score data from client and respond with high score
app.use(bodyParser.json());
app.post('/hiscores', (req, res) => {
    console.log(req.body);
    const score = req.body.score;
    const name = req.body.name;
    const ip = req.ip;
    console.log("Retrieved highscore: " + getHighscore(name, ip));
    saveScore(score, name, ip);
    res.json({highscore: getHighscore(name, ip)});
});
//Start the server
app.listen(3000, function () {
        console.log("Server is running on http://localhost:3000");
});
