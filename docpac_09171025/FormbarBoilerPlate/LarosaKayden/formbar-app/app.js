//setup
const express = require('express');
const app = express();

//requirements
require('dotenv').config();
console.log("SESSION_SECRET:", process.env.SESSION_SECRET);
const jwt = require('jsonwebtoken')


//view set
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

//session
const session = require('express-session')
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
    store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

//login function
function isAuthenticated(req, res, next) {
    if (req.session.user) return next();
    res.redirect(`/login`);
}

//routes
app.get('/', isAuthenticated, (req, res) => {
    res.render('index');
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        const data = jwt.decode(req.query.token);
        req.session.user = data.displayName;
        res.redirect('/');
    } else {
        res.redirect(`${process.env.AUTH_URL}/oauth?redirectURL=${process.env.THIS_URL}`);
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});