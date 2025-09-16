const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
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
        const data = req.body;

        if (!data.name == null) {
            throw new Error('Name is required!');
        }

        const clientIp = req.ip;
        console.log(`Name: ${data.name}, Score: ${score}, IP: ${clientIp}`);
        db.run('INSERT INTO scores (name, score, ip) VALUES (?, ?, ?)', [data.name, score, clientIp], function(err) {
            if (err) {
                console.error('Error inserting score into database', err);
                return res.redirect('/error?message=' + encodeURIComponent('Database error!'));
            }
            console.log(`A row has been inserted with rowid ${this.lastID}`);
        });
        res.send('Score submitted!');
    } catch (error) {
        res.redirect('error')
        console.log("1");
    }
});

app.get('/error', (req, res) => {
    const message = req.query.message || 'No name.';
    console.log(`Error message: ${message}`); // Debugging
    res.render('error', { message });
});

app.get('/hiscores', (req, res) => {
    res.render('hiscores');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});