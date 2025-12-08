// imports
require('dotenv').config();

const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');
const logger = require('./modules/logger');
const sqlite3 = require('sqlite3').verbose();
const connect_sqlite3 = require('connect-sqlite3')(express-session);
const { io } = require('socket.io-client');
const http = require('http').createServer(app);
// setting up the database
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        logger.error('Could not connect to database', err);
    } else {
    logger.info('Connected to SQLite database'); 
} 
});   