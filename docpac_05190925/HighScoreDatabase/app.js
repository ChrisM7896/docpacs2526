const { entry, json } = require('body-parser');
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/game', (req, res) => {
    res.render('game');
});

app.post('/game', (req, res) => {
    res.redirect('/hiscores');
});

app.get('/hiscores', (req, res) => {
    res.render('hiscores');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

