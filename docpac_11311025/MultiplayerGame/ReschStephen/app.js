// Imports
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);

const players = {
    player1: { x: 314, y: 366 },
    player2: { x: 720, y: 366 }
};

// Database setup
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        console.log('Connected to SQLite database.');
    }
});

//Constants
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));


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

        // Save user to database if not exists
        db.run('INSERT OR IGNORE INTO users (username) VALUES (?)', [tokenData.displayName], function z(err) {
            if (err) {
                return console.error(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
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

app.get('/sendpogs', isAuthenticated, (req, res) => {
    const data = {
        from: 106,
        to: 111,
        amount: 200,
        pin: 1234,
        reason: 'Test pog transfer'
    };

    socket.emit('transferDigipogs', data)

    res.send('Pogs Sent!');
});


// // Socket.io Client to auth server
// const socket = io(AUTH_URL, {
//     extraHeaders: {
//         api: API_KEY
//     }
// });

// socket.on('connect', () => {
//     console.log('Connected to auth server');
//     socket.emit('getActiveClass');
// });

// socket.on('disconnect', () => {
//     console.log('Disconnected from auth server');
// });

// socket.on('setClass', (classData) => {
//     console.log('Received class data:', classData);
//     socket.emit('classUpdate');
// });

// socket.on('classUpdate', (classroomData) => {
//     console.log(`Classroom id: ${classroomData.id}, Name: ${classroomData.className}, Active: ${classroomData.isActive}`);
//     console.log(`Response: ${classroomData.poll.totalResponses} / ${classroomData.poll.totalResponders}`);
//     console.log(classroomData.poll.responses);
// });

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send initial player positions to the new client
    socket.emit('initialize', players);

    // Handle player movement
    socket.on('move', (data) => {
        if (data.player === 'player1') {
            players.player1.x += data.dx;
            players.player1.y += data.dy;
        } else if (data.player === 'player2') {
            players.player2.x += data.dx;
            players.player2.y += data.dy;
        }

        // Broadcast updated positions to all clients
        io.emit('update', players);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
