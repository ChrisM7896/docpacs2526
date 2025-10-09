//setup
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const session = require("express-session");
const jwt = require('jsonwebtoken');
const ejs = require("ejs");
const app = express()
const PORT = 3000;

const AUTH_URL = "https://formbeta.yorktechapps.com/";
const THIS_URL = "http://localhost:3000/";


//use public
app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new sqlite3.Database("./data/database.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.use(session({
    secret: 'secret_tunnel',
    resave: false,
    saveUninitialized: false,
}));

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect(`/`)
}

app.get('/', (req, res) => {
    if (req.session.user) return res.redirect('/chat')
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token)
        req.session.token = tokenData
        req.session.user = tokenData.displayName
        req.session.userid = tokenData.id

        db.get('SELECT * FROM users WHERE fb_id = ?', [tokenData.id], (err, row) => {
            if (err) {
                console.error(err.message);
            }
            if (!row) {
                db.run('INSERT INTO users (fb_id, name, profile_checked) VALUES (?, ?, ?)', [tokenData.id, tokenData.displayName, 0], (err) => {
                    if (err) {
                        console.error(err.message);
                    }
                    console.log(`A row has been inserted with fb_id ${tokenData.id}`);
                    return res.redirect('/chat')
                });
            } else {
                console.log("User already exists")
                return res.redirect('/chat')
            }
        });

    } else {
        res.redirect(`${AUTH_URL}oauth?redirectURL=${THIS_URL}`)
    }
})

app.get('/chat', isAuthenticated, (req, res) => {
    try {
        res.render('chat', { user: req.session.user })
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Internal Server Error");
    }
})

/* chatgibity*/
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);

let activeUsers = {}; // { socket.id: username }

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // When the client sends their name after connecting
    socket.on('setName', (name) => {
        activeUsers[socket.id] = name;
        console.log(`${name} joined the chat`);

        // Send updated list of usernames to everyone
        io.emit('userList', Object.values(activeUsers));
    });

    // When a message comes in
    socket.on('chatMessage', (msg) => {
        const sender = activeUsers[socket.id] || "Anonymous";
        io.emit('chatMessage', { name: sender, message: msg });
    });

    // When someone disconnects
    socket.on('disconnect', () => {
        const name = activeUsers[socket.id];
        console.log(`${name || "Someone"} disconnected`);
        delete activeUsers[socket.id];

        // Send updated list to everyone
        io.emit('userList', Object.values(activeUsers));
    });
});

http.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});