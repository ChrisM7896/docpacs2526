// Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const logger = require('./modules/logger');


// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        logger.error('Could not connect to database', { error: err.message });
    } else {
        logger.info('Connected to database');
    }
});

// Constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;

        //Save use to database if not exists
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function (err) {
            if (err) {
                return logger.error('Error saving user to database', { error: err.message });
            }
            logger.info('User saved to database', { username: tokenData.displayName });
        });

        res.redirect('/');

    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

/*app.get('sendpogs'), isAuthenticated, (req, res) => {
    const data = {
        from: 1,
        to: 97,
        amount: 10,
        pin: 1234,
        reason: 'Test pogs transfer'
    }

    socket.emit('transferDigipogs', data);

    res.send('Pogs sent!');
};*/

const socket = io(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

socket.on('connect', () => {
    logger.info('Connected to auth server');
});

socket.on('disconnect', () => {
    logger.info('Disconnected from auth server');
});

socket.on('setClass', (classData) => {
    logger.info('Received class data', { classData });
    socket.emit('classUpdate');
});

socket.on('classUpdate', (classroomData) => {
    logger.info(`Classroom id: ${classroomData.id}, Name: ${classroomData.className}, Active: ${classroomData.isActive}`);
    logger.info(`Responses: ${classroomData.poll.totalResponses} / ${classroomData.poll.totalResponders}`);
    logger.info(classroomData.poll.responses);

    
});

socket.on('connect', () => {
    socket.emit('getActiveClass');
});

// Start server
app.listen(PORT, () => {
    logger.info('Server started', { port: PORT, url: `http://localhost:${PORT}` });
});