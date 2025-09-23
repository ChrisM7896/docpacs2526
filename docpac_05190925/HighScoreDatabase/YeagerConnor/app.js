const express = require ('express');
const sqlite3 = require ('sqlite3').verbose();
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());

const port = 3000;

let db = new sqlite3.Database('data/gamedata.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.get('/highscores', (req, res) => {
    try {
        db.all('SELECT * FROM users ORDER BY score DESC', (err, rows) => {
            if (err) {
                console.error(err.message);
            };
            rows = rows.slice(0, 10);
            res.render('highscores', {users: rows});
        });
    } catch (err) {
        res.render('error', {error: err.message});
    }
});

app.post('/highscores', (req, res) => {
    try {
        console.log(req.body);
        if (req.body.score === null || req.body.username === null) {
            console.error('You dont exist, play the game first');
        };
        db.run(
            'INSERT INTO users (ip, username, score) VALUES (?, ?, ?)',
            [req.ip, req.body.username, req.body.score],
            (err) => {
                if (err) {
                    console.error(err)
                };
                res.status(200).send('Score added successfully');
            }
        );
    } catch (err) {
        console.error(err);
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 