// Installations
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { io } = require('socket.io-client');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const winston = require('winston');

// Constants
const PORT = process.env.PORT || 3000;
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${PORT}`;
const API_KEY = process.env.API_KEY || 'your_api_key'
const SECRET_KEY = process.env.SESSION_SECRET || 'your_secret_key';
