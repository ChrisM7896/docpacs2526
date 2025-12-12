require('dotenv').config();
const express = require('express');
const path = require('path');
const logger = require('./modules/logger');
const initializeDatabase = require('./scripts/initDatabase');
const sessionMiddleware = require('./middleware/session');
const app = express();
const userLayout = require('./modules/userLayout');
const isAuthenticated = require('./middleware/isAuthenticated');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const loginRoutes = require('./routes/login');
const homeRoutes = require('./routes/home')
const profileRoutes = require('./routes/profile')
const usersRoutes = require('./routes/api/users')
const http = require('http');
const setupSocketServer = require('./modules/socketServer');
// Import your socket event handlers
let db;

const AUTH_URL = process.env.FORMBAR_REDIRECT_URI || 'http://localhost:420/oauth';  
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.FORMBAR_CLIENT_SECRET || 'your_api_key';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const PORT = process.env.PORT || 3000;


// Ensure the data directory exists
const dataDir = path.resolve(__dirname, './data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
    logger.info('Created data directory for session storage.');
}

// Set up view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use session middleware
app.use(sessionMiddleware);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/uploads', express.static(path.join(__dirname, 'data/uploads')));



// Routes
app.use('/', homeRoutes)
app.use('/', loginRoutes)
app.use('/', profileRoutes)
app.use('/api', usersRoutes)


// Create HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = setupSocketServer(server);

// Start the server
server.listen(PORT, async () => {
    try {
        db = await initializeDatabase();
        logger.info(`Server is running on http://localhost:${PORT}`);
        logger.info('Socket.IO server initialized');
    } catch (err) {
        logger.error(`Failed to start server: ${err.message}`);
    }
});