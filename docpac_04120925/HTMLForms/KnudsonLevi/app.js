const fs = require('fs');
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.listen(3000, () => {console.log('Server is running on http://localhost:3000');});
//read data from file
function loadDatabase() {
    if (fs.existsSync('data.json')) {
        database = JSON.parse(fs.readFileSync('data.json'));
    }
}
//write data to file
function saveDatabase() {
    fs.writeFileSync('data.json', JSON.stringify(database));
}
loadDatabase();

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/add', (req, res) => {
    res.render('add');
});
app.post('/add', express.urlencoded({ extended: true }), (req, res) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const email = req.body.email;
    const password = req.body.password;
    let error = null;
    if (!email || !password) {
        error = "Username and Password are required.";
    } else if (!emailPattern.test(email)) {
        error = "Invalid email.";
    } else {
        console.log(`Received: Username - ${email} Password - ${password}`);
        database.data[email] = password;
        saveDatabase();
    }
    if (error) {
        res.render('error', {error: error})
    } else {
        res.redirect('/');
    }
});
app.get('/view', (req, res) => {
    loadDatabase();
    res.render('view', {data: database.data});
});