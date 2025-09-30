const express = require('express');
const app = express();

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        process.exit(1);  // exit process if db connection fails
    }
    console.log('Connected to the database.');
});

// Start server only after table is ready
app.listen(3000, () => {
    console.log('Server started on port 3000');
});

app.set('view engine', 'ejs');
app.set('trust proxy', true);

app.use(express.urlencoded({ extended: true }));

// home page
app.get('/', (req, res) => {
    res.render('index');
});

// game page
app.get('/game', (req, res) => {
    res.render('game');
});

// error page
app.get('/error', (req, res) => {
    res.render('error');
});

app.post('/game', (req, res) => {
    const data = req.body;
    const ip = req.ip;
    if (data.score === undefined || data.username === undefined) {
        return res.redirect('/error');
    }
    db.run(
        'INSERT INTO masherScores (ip, name, score) VALUES (?, ?, ?)',
        [ip, data.username, data.score],
        (err) => {
            if (err) {
                console.error('DB insert error:', err);
                return res.render('error');
            }
            return res.render('index');
        }
    );
    console.log('IP:', ip);
    console.log('Data:', data);
});

// highscores page
app.get('/hiscores', (req, res) => {
    db.all(
        'SELECT name, score FROM masherScores ORDER BY score DESC LIMIT 10', [],
        (err, rows) => {
            if (err) {
                console.error('DB select error:', err);
                return res.render('error');
            }
            console.log('highscores retrieved');
            res.render('hiscores', { scores: rows });
        }
    );
});
