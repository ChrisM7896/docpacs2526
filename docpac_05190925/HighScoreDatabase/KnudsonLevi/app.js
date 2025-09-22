const path = require('path');
const express = require('express');
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
    return new Promise((resolve, reject) => {
        db.get('SELECT score FROM scores WHERE name = ? AND ip = ? ORDER BY score DESC LIMIT 1', [name, ip], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? row.score : 0);
            }
        });
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
//Get request for the game
app.get("/game", function (req, res) {
    res.render('buttonMasher.ejs');
});
//Get request for leaderboard
app.get("/hiscores", function (req, res) {
    db.all('SELECT name, score FROM scores ORDER BY score DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('hiscores.ejs', {data: rows});
    });
});
//Get score data from client and respond with high score
app.post('/hiscores', async (req, res) => {
    console.log("Recieved", req.body, "from client", req.ip);
    let score = req.body.score;
    let name = req.body.name;
    let ip = req.ip;
    if (name.length > 20 || name.length == 0 || name == null) {
        name = "Cheater!";
    }
    try {
        let highscore = await getHighscore(name, ip);
        if (score > 600) {
            highscore = "Cheater!";
        } else if (score > highscore) {
            saveScore(score, name, ip);
            highscore = score; 
        }
        res.json({highscore: highscore});
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Failed to retrieve highscore" });
    }
});
//Start the server
app.listen(3000, function () {
        console.log("Server is running on http://localhost:3000");
});
