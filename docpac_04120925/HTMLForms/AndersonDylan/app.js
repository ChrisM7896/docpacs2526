const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const fs = require('fs');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); // Middleware to parse URL-encoded bodies

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define a route
app.get('/', (req, res) => {
    res.render('index'); // Render the 'index.ejs' file
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
// Define a route for adding a new entry
app.get('/add', (req, res) => {
    res.render('add.ejs'); // Render the 'add.ejs' file
});

app.post('/add', express.urlencoded({ extended: true }), (req, res) => {
    try {

        if (req.body.userName === '' || req.body.password === '') {
            throw new Error("All fields are required");
        }

        if (req.body.userName === req.body.password) {
            throw new Error("Username and password cannot be the same");
        }

        const formData = {
            'userName': req.body.userName,
            'password': req.body.password
        };
        var data = fs.readFileSync('data.json', 'utf8');
        data = JSON.parse(data);
        if (!Array.isArray(data.data)) {
            data.data = [];
        }
        data.data.push(formData);
        var json = JSON.stringify(data)
        fs.writeFileSync('data.json', json)
        JSON.stringify(formData)
        res.redirect('/');
    } catch (error) {
        res.render('error.ejs', { message : error.message });
    }
});

// Define a route for viewing all entries
app.get('/view', (req, res) => {
    var data = fs.readFileSync('data.json', 'utf8'); // Read data from data.json
    var parsedData = JSON.parse(data); // Parse the JSON data
    console.log(parsedData.data);
    res.render('view', { data: JSON.stringify(parsedData.data) }); // Render the 'view.ejs' file with the data
});