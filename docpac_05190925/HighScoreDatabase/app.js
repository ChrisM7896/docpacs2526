const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyparser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
let sql;

app.set('trust proxy', true);


const db = new sqlite3.Database('./data.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});


db.all('SELECT * FROM data', [], (err, rows) => {
    if (err) {
        console.error(err.message);
    }
    rows.forEach((rows) => {
        console.log(rows);
    });
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyparser.text({ type: '*/*' }));


app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/game', (req, res) => {
    res.render('game.ejs');
});

app.get('/hiscores', (req, res) => {
    const sql = 'SELECT name, score FROM data ORDER BY score DESC LIMIT 10';

    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error(err.message);
        }

        console.log(rows);
        res.render('hiscores.ejs', {players: rows});
    });
});
app.post('/hiscores', (req, res) => {
    const { name, score } = req.body

    if (!name || !score) {
        res.render('error.ejs');
    }
    console.log(name, score);
    let ip = req.ip;
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            ip = data.ip;
            console.log(ip);

            sql = 'INSERT INTO data (ip, name, score) VALUES (?, ?, ?)';

            db.run(sql, [ip, name, score], (err) => {
                if (err) {
                    console.error(err.message);
                } else {
                    console.log('A rows has been inserted');
                }
            });
            db.all('SELECT * FROM data', [], (err, rows) => {
                if (err) {
                    console.error(err.message);
                }
                rows.forEach((rows) => {
                    console.log(rows);
                });
            });
        })
    res.redirect(`/hiscores`);
});

app.get('/error', (req, res) => {
    res.render('error.ejs');
})

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});