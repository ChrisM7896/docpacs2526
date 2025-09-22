const express = require("express");
const sqlite3 = require("sqlite3");
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static('public'));

// const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./scores.db")

app.set("view engine", "ejs");

app.listen(3000, () => {})

app.get("/", (req, res) => {
    res.render("index")
})

app.get("/hiscores", (req, res) => {
    // const scores = db;
    db.all(`SELECT * FROM scores ORDER BY score DESC LIMIT 10`, (err, rows) => {
        if (err) {
            console.log(err);
            return;
        } else {
            res.render("hiscores", {
                scores: rows
            });
        }
        
    })
})

app.post("/game", (req, res) => {
    const name = req.body.name
    const score = req.body.score
    const ip = req.ip;
    if (!name) {
        res.send("Error: Name not provided <br> <a href='javascript:history.back()'>Go Back</a>")
        return
    }
    db.run(
        `INSERT INTO scores (ip, name, score) VALUES (?, ?, ?)`,
        [ip, name, score],
        res.redirect("/hiscores")
    );
});
app.get("/game", (req, res) => {
    res.render("game");
})

// app.post("/game", (req, res) => {
    
// })