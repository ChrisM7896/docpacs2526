const jwt = require('jsonwebtoken');
const session = require('express-session');
const app = require('express');

const AUTH_URL = 'https://formbeta.yorktechapps.com'
const THIS_URL = 'http://localhost:3000/login'

const sessionOptions = {
    secret: "It's a secret",
    resave: false,
    saveUninitialized: false,
}

app.use(session(sessionOptions));