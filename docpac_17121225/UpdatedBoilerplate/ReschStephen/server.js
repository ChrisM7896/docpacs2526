// Imports
import 'dotenv/config';
import { logging } from './modules/logger.js';
import sessionMiddleware from './middleware/session.js';
import express from 'express';
const app = express();
import session from 'express-session';
import sqlite3Package from 'sqlite3';
const sqlite3 = sqlite3Package.verbose();
import connectSqlite3 from 'connect-sqlite3';
const SQLiteStore = connectSqlite3(session);

app.use(sessionMiddleware);

// Database setup
const db = new sqlite3.Database('./data/database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err);
    } else {
        logging('INFO', 'Connected to SQLite database.');
    }
});

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logging('INFO', `Server is running on http://localhost:${PORT}`);
});
// Socket.io setup
import { Server } from 'socket.io';
const io = new Server(server);
import onConnect from './sockets/onConnect.js';
import onJoinRoom from './sockets/onJoinRoom.js';
onConnect(io);
onJoinRoom(io);

import onChat from './sockets/onChat.js';
onChat(io);

export { app, server, io, db };
