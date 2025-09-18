const { error } = require('console');
const express = require('express');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');

const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/game', (req, res) => {
    res.render('game.ejs');
});

app.post('/submit-score', (req, res) => {
    console.log(req.body);
    const { name, score } = req.body;
    let hostname = req.hostname;
    db.run(`INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)`, [name, score, hostname], function (err) {
        if (err) {
            return console.log(err.message);
        }
    });
    console.log('Score submitted successfully');
});

app.get('/highscores', (req, res) => {
    try {
        db.all(`SELECT name, score FROM scores ORDER BY score DESC LIMIT 10`, [], (err, rows) => {
            if (err) {
                throw err;
            }
            console.log(rows);
            res.render('highscores.ejs', { highscores: JSON.stringify(rows) });
        });
    }
    catch (error) {
        res.render('error.ejs');
    }
});