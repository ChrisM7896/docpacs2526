
// server setup
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');
const { PassThrough } = require('stream');
const AUTH_URL = 'https://formbeta.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/';
const API_key =  'api_key_here';


app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// create an HTTP server and attach Socket.IO so the client can connect to /socket.io/socket.io.js
const server = http.createServer(app);
const io = new Server(server);

// Keep a map of connected users: socketId -> displayName
const onlineUsers = new Map();

// Basic Socket.IO handlers
io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // When a client joins: client will emit 'connection' with displayName
    socket.on('connection', (displayName) => {
        socket.data.displayName = displayName || 'Guest';
        onlineUsers.set(socket.id, socket.data.displayName);
        console.log(`Socket ${socket.id} joined as:`, socket.data.displayName);

        // broadcast updated user list to all clients under 'userList'
        io.emit('userList', Array.from(onlineUsers.values()));
    });

    // chat message (client emits 'chatMessage')
    socket.on('chatMessage', (msg) => {
        const from = socket.data.displayName || msg?.from || 'Guest';
        const payload = (typeof msg === 'string') ? { from, text: msg } : { from, ...msg };
        console.log('chatMessage received:', payload);
        io.emit('chatMessage', payload);
    });
    // disconnect
    socket.on('disconnect', (reason) => {
        console.log('Client disconnected:', socket.id, 'reason:', reason);
        // remove from online users and notify clients
        if (onlineUsers.has(socket.id)) {
            onlineUsers.delete(socket.id);
            io.emit('userList', Array.from(onlineUsers.values()));
        }
    });
});

// middleware (for formbar)
app.use(session({
    secret: 'birds_dont_sing',
    resave: false,
    saveUninitialized: true,    
}))
// is authenticated function
function isAuthenticated (req, res, next) {
    if (req.session.user) next()
    else res.redirect ('/')
}

// '/' routes
app.get('/', (req, res) => {
    if (req.session.user) { res.redirect ('/chat'); return; }
    if (req.query.token) {
        let tokenData = jwt.decode (req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect ('/chat');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
});
// post request to '/'
app.post('/', (req, res) => {
    const userInput = req.body.userInput;
    res.render('index', { userInput });
});
// '/chat' routes
app.get('/chat', isAuthenticated, (req, res) => {
    // safely read id/displayName from session (fall back to user object or unknown)
    const id = req.session?.token?.id || req.session?.user?.id || 'unknown';
    const displayName = req.session?.token?.displayName || req.session?.user?.displayName || 'Guest';

    if (req.session.user) {
        res.render('chat', { user: req.session.user, id, displayName });
    } else {
        res.redirect('/');
    }
});
// Note: server is the HTTP server we created above; start it so Socket.IO is active
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
