const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cryto = require('crypto');
const path = require('path');
const app = express();
app.set('view engine', 'ejs');

//encryption setup
const SECRET_KEY = '0b8f98b4974cb65067589494f9c2e8ba8be5aeae598958901dbaa94c7421a260';

// Database setup
const dbFile = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});
function CreateUser(username, email, password) {

app.use(express.static(path.join(__dirname, 'public')));
//GET endpoint for the root of the app
app.get('/', (req, res) => {
    res.render('index.ejs');
});
//Get endpoint for the login page
app.get('/login', (req, res) => {
    res.render('login.ejs');
});
//Get endpoint for the signup page
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});
app.post('/login', (req, res) => {

});
app.post('/signup', (req, res) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordPattern = /^[a-zA-Z0-9!@#$%^&*()\-_+=\{\}\[\]<>,.:;]{5,20}$/;
    const usernamePattern = /^[a-zA-Z0-9]{3,20}$/;
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    let error = null;
    if (!email || !password || !username) {
        error = "Username and Password are required.";
    } else if (!usernamePattern.test(username)) {
        error = "Invalid username.";
    } else if (!emailPattern.test(email)) {
        error = "Invalid email.";
    } else if (!passwordPattern.test(password)) {
        error = "Password must be 5-20 characters and can include letters, numbers, and special characters.";
    } else {
        console.log(`Received: Usernam - ${username} Email - ${email} Password - ${password} from ${req.ip}`);
        createUser();
    }
    if (error) {
        res.render('error', {error: error})
    } else {
        res.redirect('/');
    }
});
//start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});