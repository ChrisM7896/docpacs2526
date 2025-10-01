const jwt = require('jsonwebtoken');
const session = require('express-session');
const express = require('express');
app = express();

const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'

const sessionOptions = {
    secret: "It's a secret",
    resave: false,
    saveUninitialized: false,
}

app.use(session(sessionOptions));
app.use(path.join(__dirname + 'public'));
app.set('view engine', 'ejs');

function isAuthenticated(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

app.get('/' , isAuthenticated, (req, res) => {
    res.render('index.ejs');
});

app.get('/profile', isAuthenticated, (req, res) => {   
    res.render('profile.ejs', {user: req.session.user});
});

app.post('/profile', isAuthenticated, (req, res) => {   
    boxChecked = req.body.checkbox;
});

app.get('/login', (req, res) => {
    if (req.query.token) {
        let tokenData = jwt.decode(req.query.token);
        req.session.token = tokenData;
        req.session.user = tokenData.displayName;
        res.redirect('/profile');
    } else {
        res.redirect(`${AUTH_URL}/oauth?redirectURL=${THIS_URL}`);
    }
});

app.listen(3000, () => {console.log('Listening on port 3000');});