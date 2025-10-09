const session = require('express-session');
const jwt = require('jsonwebtoken');
const path = require('path');

const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const AUTH_URL = 'https://formbeta.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/handle';

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

app.use(
    session({
        secret: 'venture',
        resave: false,
        saveUninitialized: true,
    })
);

io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
} 

app.get('/', (req, res) => {
    console.log('Session user:', req.session.user); // Debugging line

    if (req.session.user) {
        res.render('index', { user: req.session.user });
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/handle', (req, res) => {
    if (req.session.user) {
        res.redirect('/chat');
        return;
    }
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);

        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect('/chat');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat', { user: req.session.user });
});    

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});