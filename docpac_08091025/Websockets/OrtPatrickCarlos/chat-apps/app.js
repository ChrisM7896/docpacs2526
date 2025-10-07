const express = require('express');
const app = express();
const session = require('express-session');
const jwt = require('jsonwebtoken');
const AUTH_URL = 'https://formbeta.yorktechapps.com';
const THIS_URL = 'http://localhost:3000/handle';

app.set('view engine', 'ejs');
app.use(express.static('public'));


app.use(
    session({
        secret: 'venture',
        resave: false,
        saveUninitialized: true,
    })
);

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
} 

app.get('/', (req, res) => {
    console.log('Session user:', req.session.user); // Debugging line

    if (req.session.user) {
        res.render('index', { user: req.session.user });
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/handle', (req, res) => {
    if (req.session.user) {
        res.redirect('/chat');
        return;
    }
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);

        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect('/chat');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.get('/chat', isAuthenticated, (req, res) => {
    res.render('chat', { user: req.session.user });
});    

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});