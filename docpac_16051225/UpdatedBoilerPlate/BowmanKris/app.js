//import required modules
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const connectSqlite3 = require('connect-sqlite3')(session);
const socketIo = require('socket.io');
const dotenv = require('dotenv');

//load environment variables from .env file
dotenv.config();

//initialize express application
const app = express();

//middleware to parse JSON request bodies
app.use(express.json());

 process.env.PORT || 3000;