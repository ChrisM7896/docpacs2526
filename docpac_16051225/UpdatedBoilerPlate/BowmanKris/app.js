//import required modules
const express = require('express');
const session = require('express-session');
const io = require('socket.io');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
require('dotenv').config();

// retrieve environment variables
const PORT = process.env.PORT;
const HOST = process.env.HOST;
const SESSION_SECRET = process.env.SESSION_SECRET;
const DATABASE_DIR = process.env.DATABASE_DIR;
const UPLOADS_DIR = process.env.UPLOAD_DIR;
const FORMBAR_API_KEY = process.env.FORMBAR_API_KEY;
const FORMBAR_AUTH_URL = process.env.FORMBAR_AUTH_URL;
const REDIRECT_URL = `${HOST}${PORT}`;

//initialize express application
const app = express();

//set up middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//views path
app.set('views', path.join(__dirname, 'views'));

//set up session management
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

//authentication middleware
const { isAuthenticated } = require('./middleware/isAuthenticated');

//route handlers
const loginRoute = require('./routes/login');
loginRoute(app, jwt, FORMBAR_AUTH_URL, REDIRECT_URL);
const homeRoute = require('./routes/home');
homeRoute(app, isAuthenticated, FORMBAR_API_KEY, FORMBAR_AUTH_URL);

//api route
const usersRoute = require('./routes/api/users');
usersRoute(app, FORMBAR_API_KEY, FORMBAR_AUTH_URL);

//start the server
app.listen(PORT, () => {
    console.log(`Server is running at ${HOST}${PORT}`);
});