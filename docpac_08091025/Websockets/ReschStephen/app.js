const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const jwt = require('jsonwebtoken');
const path = require('path');
const session = require('express-session');
const port = 3000;
const sqlite3 = require('sqlite3').verbose();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('public'));

const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'

const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
    }
});

const sessionMiddleware = session({
    secret: 'funny string right here',
    resave: false,
    saveUninitialized: true
});

var activeUsers = [];

app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

app.get('/', isAuthenticated, (req, res) => {
    try {
        res.render('index', { user: req.session.user });
    } catch (error) {
        res.send(error.message);
    }
});

app.get('/login', (req, res) => {
    console.log(req.query.token)
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        req.session.id = tokenData.id
        res.redirect('/chat')
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
})

app.get('/chat', isAuthenticated, (req, res) => {
    try {
        res.render('chat', { user: req.session.user });
    } catch (error) {
        res.send(error.message);
    }
});

io.on('connection', (socket) => {
    console.log('A user connected');
    const session = socket.request.session;
    socket.username = session.user || 'Anonymous';
    activeUsers.push({username: socket.username, id: socket.id});
    console.log('Active users:', activeUsers);
    io.emit('active users', activeUsers);
    socket.on('chat message', (msg) => {
        console.log('data:', msg, socket.username);
        
        io.emit('chat message', {
            username: socket.username,
            message: msg
        });
    });
    socket.on('create room', (roomName) => {
        io.emit('room created', roomName);
    });
    socket.on('disconnect', () => {
        console.log('A user disconnected');
        activeUsers.pop(activeUsers.findIndex(u => u.id === socket.id));
        console.log('Active users:', activeUsers);
        io.emit('active users', activeUsers);
    });
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
