const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/hiscores.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the hiscores database.');
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index.ejs', {

    });
});

app.get('/game', (req, res) => {
    res.render('game.ejs', {

    });
});

app.post('/hiscores', (req, res) => {
    var username = req.body.username;
    const score = req.body.score;
    console.log(`Username: ${username}, Score: ${score}`);
    ipaddress = req.ip;
    console.log(ipaddress);
    if (!username || username == '') {
        username = 'Anonymous';
    }
    db.run(`INSERT INTO scores(name, score, ip) VALUES(?, ?, ?)`, [username, score, ipaddress], function(err) {
        if (err) {
            return console.log(err.message);
        }
        console.log(`A row has been inserted with rowid ${this.lastID}`);
    });
});

app.get('/hiscores', (req, res) => {
    db.all(`SELECT name, score FROM scores ORDER BY score DESC LIMIT 10`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        res.render('hiscores.ejs', {
            scores: JSON.stringify(rows)
        });
    });
    
});

app.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});