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

function findRoom() {
    
}

app.get('/', isAuthenticated, (req, res) => {
    res.render('index', { user: req.session.user });
});

app.get('/game', (req,res) => {
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
    io.emit('connected')
    socket.on('playState', (playState) => {
        console.log(playState)
        if (playState) {
            io.emit('playable')
        }
    });
    socket.on('spell', (spell) => {
        console.log(spell)
    })
    socket.on('disconnect', () => {
        console.log("User Disconnected: ", user)
    });
});



server.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});