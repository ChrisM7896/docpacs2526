const express = require("express");
const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index'), { title: 'Hame page' };
});

app.get('/highscores', (req, res) => {
    res.render('highscores', { title: 'High Scores'});
});

app.get('/game', (req, res) => {
  res.render('game');
});

app.get('/error', (req, res) => {
  res.render('error', { title: 'uh-oh' });
});

app.listen(port)