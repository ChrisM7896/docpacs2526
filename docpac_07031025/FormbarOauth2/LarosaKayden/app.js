//setup
const express = require("express");
const sqlite3 = require('sqlite3').verbose();
const path = require("path");
const session = require("express-session");
const jwt = require('jsonwebtoken');
const ejs = require("ejs");
const fs = require("fs");
const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

let db = new sqlite3.Database("./data/database.db", (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/profile", (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    
});