const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const session = require('express-session')
//add encryption if necessary
const app = express();
const Auth_URL = 'https://formbeta.yorktechapps.com'
const This_URL = 'http://localhost:3000/login'

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/templatedatabase.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.set('view engine', 'ejs');

app.use(session({
    secret: 'secretString',
    resave: false,
    saveUninitialized: false
}))

function isAuthenticated(req, res, next) {
    if (req.session.user) next()
    else res.redirect('/login')
}



app.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});