//const https = require('https');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const express = require('express');
const app = express();
/*
const options = {
    key: fs.readFileSync("/ssl/server.key", "utf8"),
    cert: fs.readFileSync("/ssl/server.cert", "utf8"),
};
*/
// Load highscores from file
const highscoreFile = 'highscores.json';
function loadHighscores() {
  if (fs.existsSync(highscoreFile)) {
    highscores = JSON.parse(fs.readFileSync(highscoreFile));
  }
}

// Save highscores to file
function saveHighscores() {
  fs.writeFileSync(highscoreFile, JSON.stringify(highscores));
}

// Get request for root of the app
app.use(express.static('public'));
app.get("/", function (req, res) {
    console.log("Highscore for " + req.ip + ": " + highscores[req.ip]);
    // Sending index.html to the browser
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

//Get score data from client and respond with high score
app.use(bodyParser.json());
app.post('/api/endpoint', (req, res) => {
  const score = req.body.score;
  const ip = req.ip;
  if (!highscores[ip] || score > highscores[ip]) {
    highscores[ip] = score;
    saveHighscores();
    console.log("New highscore for " + ip + ": " + score);
  }
  res.json({highscore: highscores[ip]});
});

//Start the server
/*
https.createServer(options, app).listen(443, function () {
        console.log("Server is running on https://ivorymonster.com");
        // Call loadHighscores on server start
        loadHighscores();
    });*/
app.listen(3000, function () {
        console.log("Server is running on http://localhost:3000");
        // Call loadHighscores on server start
        loadHighscores();
    });
