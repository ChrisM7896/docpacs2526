const express = require('express');
const path = require('path');
const logger = require('./modules/logger');
const initializeDatabase = require('./scripts/initDatabase');
const sessionMiddleware = require('./middleware/session');
const app = express();
const PORT = process.env.PORT || 3000;
let db;
// Middleware to parse JSON requests
app.use(express.json());
// Use session middleware
app.use(sessionMiddleware);
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
// Initialize the database and start the server
initializeDatabase()
    .then((database) => {
        db = database;
        app.listen(PORT, () => {
            logger.info(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        logger.error(`Failed to start server: ${err.message}`);
    });

// Routes
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/profile', (req, res) => {
    if (req.session && req.session.user) {
        res.sendFile(path.join(__dirname, 'public', 'profile.html'));
    } else {
        res.redirect('/login');
    }
});