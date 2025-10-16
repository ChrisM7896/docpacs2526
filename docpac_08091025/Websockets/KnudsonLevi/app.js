const express = require('express')
const session = require('express-session');
const app = express();
const jwt = require('jsonwebtoken');
const path = require('path');
const socketio = require('socket.io');

const AUTH_URL = 'https://formbeta.yorktechapps.com'

//Track connected users by their id and associated sockets
const users = new Map();

const sessionOptions = {
    secret: "It's a secret",
    resave: false,
    saveUninitialized: false,
}
//Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/');
}

app.use(session(sessionOptions));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
//Home page
app.get('/', (req, res) => {
    if (req.session.user) { //If user is already logged in, redirect to chat
        res.redirect('/chat');
    } else if (req.query.token) { //If token is present in query, decode it and set session variables
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        req.session.uid = tokenData.id;
        console.log(`User ${tokenData.displayName} logged in with id ${tokenData.id}`);
        res.redirect('/chat');
    } else { //If no token, redirect to auth server
        res.redirect(`${AUTH_URL}/oauth?redirectURL=http://${req.hostname}:3000/`);
    }
});
//Chat page
app.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat', {user: req.session.user, id: req.session.uid});
});
//Start server
const server = app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});
//Setup socket.io
const io = socketio(server);
//Handle socket connections
io.on('connection', (socket) => {
    console.log('New client connected');
    //Handle new user joining
    socket.on('newUser', (data) => {
        const userId = data.userId
        socket.userId = userId;
        socket.user = data.user;
        let entry = users.get(userId);
        //If user is new, create entry
        if (!entry) {
            entry = { name: data.user, sockets: new Set() };
            users.set(userId, entry);
        }
        //Add this socket to the user's set of sockets
        entry.sockets.add(socket.id);
        console.log(`User ${entry.name} (id=${userId}) connected on socket ${socket.id}`);
        //Send updated user list to all clients
        io.emit('userList', Array.from(users.values()).map(e => e.name));
    });
    //Handle incoming messages
    socket.on('message', (data) => {
        const sender = socket.user || data.user || 'unknown';
        console.log(`Message from ${sender}: ${data.message}`);
        io.emit('message', { user: sender, message: data.message });
    });
    //Handle socket disconnection
    socket.on('disconnect', () => {
        const userId = socket.userId;
        if (userId) { //If the socket was associated with a user, remove it from their set
            const entry = users.get(userId);
            if (entry) {
                entry.sockets.delete(socket.id);
                if (entry.sockets.size === 0) { //If no more sockets for this user, remove them entirely
                    users.delete(userId);
                    console.log(`User ${entry.name} (id=${userId}) fully disconnected`);
                    io.emit('userList', Array.from(users.values()).map(e => e.name));
                } else { //Otherwise just log the disconnection
                    console.log(`Socket ${socket.id} for user ${entry.name} (id=${userId}) disconnected; other sockets remain`);
                }
            }
        } else { //Socket had no associated user
            console.log(`A socket without user info disconnected: ${socket.id}`);
        }
    });
});