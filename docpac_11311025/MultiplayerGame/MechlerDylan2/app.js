const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session')
const { createServer } = require('node:http')
const { join } = require("node:path")
const { Server } = require("socket.io")
//add encryption if necessary
const app = express();
const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'
const server = createServer(app);
const io = new Server(server);
var Player = { Player1: null, Player2: null }
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/templatedatabase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.set('view engine', 'ejs');

const middleWare = session({
    secret: 'secretString',
    resave: false,
    saveUninitialized: false
})

app.use(middleWare);

io.use((socket, next) => {
    middleWare(socket.request, {}, next)
})

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect(`/login?redirectURL=${THIS_URL}`);
};

function findRoom(user) {
    if (!Player.Player1) {
        Player.Player1 = user
    } else if (!Player.Player2) {
        Player.Player2 = user
    }
};

function startGame() {
    Player.Player1Health = 100
    Player.Player2Health = 100
    Player.turn = 1
    Player.Player1Spell = null
    Player.Player2Spell = null
}

function spellCast() {
    if (Player.turn = 1) {
        //check if you can use turn to see who cast a spell
    }
}

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/game', (req, res) => {
    res.render('game.ejs')
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        res.redirect('/')
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`)
    }
});

io.on('connection', (socket) => {
    var data = socket.request.session;
    const user = data.user
    console.log("User Connected: ", user);
    socket.join("some room");
    findRoom(user)
    io.emit('connected')
    io.to("some room").emit('playerJoined', Player)
    socket.on('playState', (playState) => {
        console.log(playState)
        if (playState) {
            io.emit('playable')
        }
    });
    socket.on('spell', (spell) => {
        console.log(spell)
        console.log(user)
    })
    socket.on('disconnect', () => {
        console.log("User Disconnected: ", user)
    });
});



server.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});