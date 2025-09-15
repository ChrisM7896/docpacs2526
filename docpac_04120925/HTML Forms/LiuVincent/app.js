const express = require('express');
const fs = require('fs');
const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Route: Home
app.get('/', (req, res) => {
    res.render('index', {
        title: 'HTML Form Probably',
        message: 'Do ts form pls'
    });
});

// Route: Add Entry Form
app.get('/add', (req, res) => {
    res.render('add', {
        title: 'Add New Entry',
        message: 'Add new entry pls'
    });
});

// Route: Submit Entry
app.post('/add', (req, res) => {
    const formDone = req.body;

    try {
        // Check/initialize data file if it doesn't exist
        let data = { data: [] };
        if (fs.existsSync('data.json')) {
            const fileContent = fs.readFileSync('data.json', 'utf8');
            data = fileContent ? JSON.parse(fileContent) : { data: [] };
        }

        // Input validation
        if (!formDone.names || formDone.names.trim() === '') throw new Error('Name is required');
        if (!formDone.age || formDone.age > 150) throw new Error('Age is required and must be less than 150');
        if (!formDone.city || formDone.city.trim() === '') throw new Error('City is required');

        // Save entry
        data.data.push({
            names: formDone.names.trim(),
            age: formDone.age.trim(),
            city: formDone.city.trim()
        });

        fs.writeFileSync('data.json', JSON.stringify(data, null, 2));

        res.redirect('/view');
    } catch (err) {
        console.error(err.message);
        res.render('error', {
            title: 'Error',
            error: err.message
        });
    }
});

// Route: View Entries
app.get('/view', (req, res) => {
    try {
        const fileContent = fs.readFileSync('data.json', 'utf-8');
        const data = fileContent ? JSON.parse(fileContent) : { data: [] };

        res.render('view', {
            title: 'View Entry',
            message: 'Here\'s what you added',
            entries: data.data
        });
    } catch (err) {
        console.error(err.message);
        res.render('error', {
            title: 'Error',
            error: 'Failed to read saved entries.'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`);
});
