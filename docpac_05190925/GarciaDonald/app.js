const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

var db = new sqlite3.Database('./scores.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.get('/hiscores', (req, res) => {
    db.all('SELECT * FROM scores ORDER BY score DESC LIMIT 10', [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error retrieving high scores');
        } else {
            res.render('hiscores', { scores: rows });
        }
    });
});

app.post('/hiscores', (req, res) => {
    console.log(req.body);
    const { name, score } = req.body;
    const ip = req.hostname;
    db.run('INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)', [name, score, ip], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send('Error submitting score');
        } else {
            console.log(`Received score submission: ${name} - ${score}`);
            res.status(200).send({ message: 'Score submission received' });
        }
    });
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000')
})