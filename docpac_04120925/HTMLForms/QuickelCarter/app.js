const express = require('express');
const app = express();
const fs = require('fs');

// read data from JSON file
var dataObj = JSON.parse(fs.readFileSync('data.json', 'utf8'));


// set the view engine to ejs (all lowercase -> CASE SENSITIVE!)
app.set('view engine', 'ejs');

//middleware; between app.get and res.send -> intervenes in the request-response cycle
app.use(
    (req, res, next) => {
        console.log("To homepage");
        next()
    }
);

// used to parse the form data so it can be converted into a JS object -> extended: true allows actual objects -> called urlencoded because form data is sent in URL encoding
app.use(express.urlencoded({ extended: true }));

// home page
app.get('/', (req, res) => {
    res.render('index');
});

// add page
app.get('/add', (req, res) => {
    res.render('add');
});

// view page
app.get('/view', (req, res) => {
    const entries = dataObj.data;
    res.render('view', { entries: entries });
});

// handle form submission
app.post('/add', (req, res) => {
    const filledForm = req.body;
    console.log(filledForm);
    // is rating negative?
    if (filledForm.rating < 0){
        return res.send("Rating must be a positive number<br><a href='/add'>Go back to Add Entry</a>");
    // is rating greater than 100?
    } else if (filledForm.rating > 100){
        return res.send("Rating must be less than or equal to 100<br><a href='/add'>Go back to Add Entry</a>");
    } else {
        dataObj.data.push(filledForm);
        fs.writeFileSync('data.json', JSON.stringify(dataObj, null, 2));
        console.log(dataObj);
    }
    res.send("Entry Added<br><a href='/'>Go to Homepage</a>");
});

// start the server
app.listen(3000, () => {
    console.log("Server started on port 3000");
});