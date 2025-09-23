const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cryto = require('crypto');
const app = express();
app.set('view engine', 'ejs');

//encryption setup
const ENCRYPTION_KEY = '0b8f98b4974cb65067589494f9c2e8ba8be5aeae598958901dbaa94c7421a260';


//GET endpoint for the root of the app
app.get('/', (req, res) => {
    res.render('index.ejs');
});

//start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});