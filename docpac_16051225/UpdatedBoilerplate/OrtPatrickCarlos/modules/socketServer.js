const sessionMiddleware = require('./middleware/session');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const logger = require('./modules/logger');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;
// Wrap session middleware for Socket.IO
const wrap = (middleware) => (socket, next) => middleware(socket.request, {}, next);
io.use(wrap(sessionMiddleware));
// Handle Socket.IO connections
io.on('connection', (socket) => {
    const session = socket.request.session;
    if (session && session.user) {
        logger.info(`User ${session.user.username} connected via Socket.IO`);
        socket.emit('welcome', `Welcome back, ${session.user.username}!`);
    } else {
        logger.info('An unauthenticated user connected via Socket.IO');
        socket.emit('welcome', 'Welcome, guest!');
    }
    socket.on('disconnect', () => {
        logger.info('User disconnected from Socket.IO');
    });
});


