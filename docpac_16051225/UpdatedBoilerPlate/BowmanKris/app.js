//import required modules
const express = require('express');
const session = require('express-session');
const io = require('socket.io');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');

//import custom middleware and route handlers
const isAuthenticated = require('./middleware/isAuthenticated');
const homeRoute = require('./routes/home');
const loginRoute = require('./routes/login');
const logoutRoute = require('./routes/logout');

//load environment variables from .env file
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
    //store: new SQLiteStore({ dir: DATABASE_DIR }),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Apply middleware globally
app.use((req, res, next) => {
    console.log('Session data:', req.session); // Debugging log
    next();
});

//route handlers
homeRoute(app, isAuthenticated);

loginRoute(app, jwt, FORMBAR_AUTH_URL, REDIRECT_URL);

logoutRoute(app);

//api route
const usersRoute = require('./routes/api/users');
usersRoute(app, FORMBAR_API_KEY, FORMBAR_AUTH_URL);

//start the server
app.listen(PORT, () => {
    console.log(`Server is running at ${HOST}${PORT}`);
});