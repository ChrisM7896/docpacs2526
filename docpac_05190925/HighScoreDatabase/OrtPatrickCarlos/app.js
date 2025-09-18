const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

// Connect to the database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        console.log('Connected to database');
        // Create the scores table if it doesn't exist
        db.run(`
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                score INTEGER NOT NULL,
                ip TEXT NOT NULL
            )
        `, (err) => {
            if (err) {
                console.error('Error creating table:', err.message);
            }
        });
    }
});

// Middleware setup
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.post('/game', (req, res) => {
    try {
        const { name, score } = req.body;

        if (!name || score == null) {
            throw new Error('Name and score are required!');
        }

        const clientIp = req.ip;
        console.log(`Name: ${name}, Score: ${score}, IP: ${clientIp}`);

        // Insert the data into the database
        db.run('INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)', [name, score, clientIp], function(err) {
            if (err) {
                console.error('Error inserting score into database:', err.message);
                return res.status(500).send('Failed to save score.');
            }

            console.log(`Score saved with rowid ${this.lastID}`);
            res.status(200).send('Score submitted successfully.');
        });
    } catch (error) {
        console.error('Error processing request:', error.message);
        res.status(400).send(error.message);
    }
});

app.get('/hiscores', (req, res) => {
    db.all('SELECT * FROM scores ORDER BY score DESC', (err, rows) => {
        if (err) {
            console.error('Error retrieving scores from database:', err.message);
            return res.redirect('/error?message=' + encodeURIComponent('Failed to retrieve scores.'));
        }
        res.render('hiscores', { scores: rows });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});