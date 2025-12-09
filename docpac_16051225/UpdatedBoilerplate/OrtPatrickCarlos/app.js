require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./modules/logger');
const initializeDatabase = require('./scripts/initDatabase');
const sessionMiddleware = require('./middleware/session');
const app = express();
const PORT = process.env.PORT || 3000;
const userLayout = require('./modules/userLayout');
const { log } = require('console');
let db;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Middleware to parse JSON requests
app.use(express.json());
// Use session middleware
app.use(sessionMiddleware);
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
    logger.info(`Rendering home page for user: ${req.session.user ? req.session.user.id : 'Guest'}`);
    const layoutData = userLayout.getLayoutData(req.session.user);
    res.render('home', layoutData);
});

app.get('/login', (req, res) => {
    res.render('login', { errorMessage: null }); // Pass errorMessage as null initially
});

app.get('/profile', (req, res) => {
    if (req.session && req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

app.listen(PORT, async () => {
    try {
        db = await initializeDatabase();
        logger.info(`Server is running on http://localhost:${PORT}`);
    } catch (err) {
        logger.error(`Failed to start server: ${err.message}`);
    }
});