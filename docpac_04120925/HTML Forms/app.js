const express = require("express");
const fs = require("fs");
const app = express();
let dataTable = JSON.parse(fs.readFileSync("data.json", "utf-8")); //references the data.json file 

app.use(
    express.urlencoded({
        extended: true //turns everything sent as a string into an object to add it data.json
    })
);

app.set("view engine", "ejs");

app.listen(3000, () => {
    console.log("Success");
    
});

app.get("/", (req, res) => {
    res.render("index");
});
app.get("/view", (req, res) => {
    //dataTable
    res.render("view");
});

app.get("/add", (req, res) => {
    res.render("add", {
        title: "Fill out a Form"
    });
});

app.post("/add", (req, res) => {
    const fullEntry = req.body;
    const entry = req.body.entry;
    const secret = req.body.secret;
    
    if (!entry || !secret) {
        res.send("Error: Data not provided <br> <a href='javascript:history.back()'>Go Back</a>")
        return
    }
    dataTable.data.push(fullEntry);
    fs.writeFileSync("data.json", JSON.stringify(dataTable, null, 2)); //file system converts it back to a string so the user can read it
    console.log(dataTable);
    
    res.redirect("/");
});

