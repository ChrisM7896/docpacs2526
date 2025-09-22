const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = new sqlite3.Database('./data/userinfo.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.set('view engine', 'ejs');

//add project here

app.listen(3000, () => {
    console.log("Started HTTP Server on port 3000");
});