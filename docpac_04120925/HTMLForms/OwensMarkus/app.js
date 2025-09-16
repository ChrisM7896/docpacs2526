const express = require('express');
const app = express();
const fs = require('fs');
let currentSub = {};
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.get("/", (req, res) => {
    res.render("index");
});
app.get("/add", (req, res) => {
    res.render("add");
});
app.post("/add", (req, res) => {
    if (req.body.subOne == "good") {
        console.log("You feel good about turnips");}
        
    else if (req.body.subOne == "bad") {
        console.log("You feel bad about turnips");
    }
    else if (req.body.subOne == "rad") { console.log("Your just RADical man"); }
    else { console.log("Error, you aren't allowed to feel that way");}
    console.log("Your turnip feeling hex color is " + req.body.subTwo);
    currentSub = { subTypeOne: req.body.subOne, subTypeTwo: req.body.subTwo }
    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error("bigbad:",err);
            return;
        }
        tempObj = JSON.parse(data);
        console.log("the new list yo",tempObj.data);
        tempObj.data.push(currentSub);
        fs.writeFile('data.json', JSON.stringify(tempObj), (err) => {
            if (err) {
                console.error("bigbad:",err);
                return;
            }
            console.log("Data appended to file successfully.");
        });
        console.log("the newer list yo",tempObj.data);
        });
    res.redirect("/");
});
app.get("/view", (req, res) => {
    fs.readFile('data.json', (err, data) => {
        if (err) {
            console.error("bigbad:",err);
            return;
        }
        viewObj = JSON.parse(data);
        res.render("view", {viewData: viewObj.data});
        console.log("the view list yo",viewObj.data);
    });
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});