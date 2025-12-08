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
