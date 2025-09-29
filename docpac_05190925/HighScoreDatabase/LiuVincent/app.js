// Ensure required modules are imported
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Middleware to parse request body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./data/scores.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
        res.render('error', { error: 'Database connection error' });
    } else {
        console.log('Connected to database');
        db.run(
            `CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score INTEGER NOT NULL,
                ip TEXT NOT NULL
            )`
        );
    }
});

app.set('view engine', 'ejs');

// Middleware to get client IP

app.get ('/', (req, res) => {
    res.render('index');
});

app.get('/index', (req, res) => {
    res.render('game');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.use((req, res, next) => {
    req.clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    next();
});

// Route to submit a score
app.post('/game', (req, res) => {
try {
    const { name, score } = req.body;
    const clientIp = req.ip;

    if (!name || !score) {
        res.status(400).render('error', { error: 'Name and score are required' });
        return;
    }

    db.run(
        `INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)`,
        [name, score, clientIp],
        function (err) {
            if (err) {
                console.error('Database error:', err.message);
                res.status(500).json({ success: false, error: 'Database error occurred while submitting score' });
                return;
            }
            res.status(200).json({ success: true, message: 'Score submitted successfully' });
        }
    );
} catch (error) {
    console.error('Unexpected error:', error);
    res.status(500).render('error', { error: 'An unexpected error occurred' });
}
});

// Route to display high scores
app.get('/hiscores', (req, res) => {
    db.all(
        `SELECT name, score, ip FROM scores ORDER BY score DESC LIMIT 10`,
        [],
        (err, rows) => {
            if (err) {
                console.error('Database error:', err.message);
                res.render('error', { error: 'Database error occurred while fetching high scores' });
                return;
            }
            res.render('hiscores', { title: 'High Scores', scores: rows });
        }
    );
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`);
});