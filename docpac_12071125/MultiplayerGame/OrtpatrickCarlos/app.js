// Imports
require('dotenv').config();
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const SQLiteStore = require('connect-sqlite3')(session);
const http = require('http');
const { Server } = require('socket.io');
const ioClient = require('socket.io-client');
const server = http.createServer(app);
const io = new Server(server);
const path = require('path');
const TicTacToe = require('./scripts/ttt').TicTacToe;




//database setup
const db = new sqlite3.Database('./db/venture.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Connected to the database.');
    }
});

//Constants
const port = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_key';
const AUTH_URL = process.env.AUTH_URL || 'http://localhost:420/oauth';
const THIS_URL = process.env.THIS_URL || `http://localhost:${port}`;
const API_KEY = process.env.API_KEY || 'your_api_key';

// Middleware
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/shared', express.static(path.join(__dirname, 'shared')))

app.use(session({
    store: new SQLiteStore({db : 'sessions.db', dir: './db'}),
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
    if (req.query.token) {
         let tokenData = jwt.decode(req.query.token);
         req.session.token = tokenData;
         req.session.user = tokenData.displayName;

        //save user to database if not exists
        db.run (`INSERT OR IGNORE INTO users (username) VALUES (?)`, [tokenData.displayName], function(err) {
            if (err) {
                return console.log(err.message);
            }
            console.log(`User ${tokenData.displayName} saved to database.`);
        });

         res.redirect('/');

    } else {
         res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    };
});
app.post('/joinGameCode', isAuthenticated, (req, res) => {

});

app.post('/joinRandomGame', isAuthenticated, (req, res) => {

});

app.post('/createGame', isAuthenticated, (req, res) => {
    const gameCode = generateGameCode();
    activeGames.add(gameCode);
    games[gameCode] = new TicTacToe(); // Create a new game instance
    players[req.session.user] = { gameCode, symbol: 'X' }; // Assign "X" to the creator
    res.json({ gameCode, symbol: 'X' });
});

app.get('/ttt', isAuthenticated, (req, res) => {
    res.render('ttt', { user: req.session.user });
});



app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


// Socket.io client setup
const socket = ioClient(AUTH_URL, {
    extraHeaders: {
        api: API_KEY
    }
});

const games = {}; // Map game codes to TicTacToe instances
const players = {}; // Map socket IDs to player info (game code and symbol)
const activeGames = new Set(); // Track active game codes

function generateGameCode() {
    let code;
    do {
        code = Math.floor(Math.random() * 1000) + 1; // Generate a code between 1 and 1000
    } while (activeGames.has(code)); // Ensure the code is unique
    return code.toString();
}

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

socket.on('createGame', () => {
    const gameCode = generateGameCode();
    activeGames.add(gameCode);
    games[gameCode] = new TicTacToe(); // Create a new game instance
    socket.join(gameCode); // Join the room
    players[socket.id] = { gameCode, symbol: 'X' }; // Assign "X" to the creator
    socket.emit('gameCreated', { gameCode, symbol: 'X' });
    console.log(`Game created with code: ${gameCode}`);
});

socket.on('joinGameCode', (code) => {
    if (!activeGames.has(code)) {
        socket.emit('error', 'Invalid game code.');
        return;
    }

    const room = io.sockets.adapter.rooms.get(code);
    const roomSize = room ? room.size : 0; // Get the room size before joining

    if (roomSize < 2) {
        const symbol = roomSize === 0 ? 'X' : 'O'; // Assign 'X' to the first player, 'O' to the second
        socket.join(code); // Join the room
        players[socket.id] = { gameCode: code, symbol };
        socket.emit('playerAssigned', { gameCode: code, symbol });

        const updatedRoom = io.sockets.adapter.rooms.get(code); // Get the updated room after joining
        if (updatedRoom.size === 2) {
            io.to(code).emit('gameReady', 'Game is ready! Players assigned.');
        }
    } else {
        socket.emit('error', 'Room is full or invalid.');
    }
});

socket.on('joinRandomGame', () => {
    let joined = false;

    for (const gameCode of activeGames) {
        const room = io.sockets.adapter.rooms.get(gameCode);
        if (room && room.size < 2) {
            const symbol = room.size === 0 ? 'X' : 'O'; // Assign 'X' to the first player, 'O' to the second
            socket.join(gameCode);
            players[socket.id] = { gameCode, symbol };
            socket.emit('playerAssigned', { gameCode, symbol });

            joined = true;
            break;
        }
    }

    if (!joined) {
        socket.emit('error', 'No available games to join.');
    }
});

socket.on('makeMove', ({ row, col }) => {
    const player = players[socket.id];
    if (!player) {
        socket.emit('error', 'You are not part of a game.');
        return;
    }

    const { gameCode, symbol } = player;
    const game = games[gameCode];
    if (!game) {
        socket.emit('error', 'Game not found.');
        return;
    }

    if (game.currentPlayer !== symbol) {
        socket.emit('error', 'It is not your turn.');
        return;
    }

    const moveResult = game.makeMove(row, col); // Now returns a boolean
    if (moveResult) {
        io.to(gameCode).emit('updateGame', {
            board: game.board,
            currentPlayer: game.currentPlayer,
            winner: game.winner,
        });

        if (game.winner) {
            io.to(gameCode).emit('gameOver', { winner: game.winner });
            activeGames.delete(gameCode); // Remove the game from active games
            delete games[gameCode]; // Clean up the game instance
        } else if (game.checkDraw()) {
            io.to(gameCode).emit('gameOver', { draw: true });
            activeGames.delete(gameCode); // Remove the game from active games
            delete games[gameCode]; // Clean up the game instance
        }
    } else {
        socket.emit('error', 'Invalid move.');
    }
});

socket.on('resetGame', () => {
    const player = players[socket.id];
    if (!player) {
        socket.emit('error', 'You are not part of a game.');
        return;
    }

    const { gameCode } = player;
    const game = games[gameCode];
    if (!game) {
        socket.emit('error', 'Game not found.');
        return;
    }

    game.reset(); // Reset the game state
    io.to(gameCode).emit('gameReset', {
        board: game.board,
        currentPlayer: game.currentPlayer,
    });
});

socket.on('disconnect', () => {
    const player = players[socket.id];
    if (player) {
        const { gameCode } = player;
        const room = io.sockets.adapter.rooms.get(gameCode);

        if (!room || room.size === 0) {
            activeGames.delete(gameCode); // Remove the game if the room is empty
            delete games[gameCode]; // Clean up the game instance
        }

        delete players[socket.id]; // Remove the player from tracking
    }

    console.log(`Player disconnected: ${socket.id}`);
});

});





server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});