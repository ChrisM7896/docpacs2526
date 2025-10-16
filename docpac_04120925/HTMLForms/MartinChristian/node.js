const express = require('express');
const app = express();
const fs = require('fs');
app.set('view engine', 'ejs');
app.listen(3000, () => { console.log('Server is running on port 3000'); });

app.get('/', (req, res) => {
    res.render('index.ejs', { title: 'Home Page' });
});

app.get('/add', (req, res) => {
    res.render('add.ejs', { title: 'Add Entry' });
});

app.post('/add', express.urlencoded({ extended: true }), (req, res) => {
        var { color, password } = req.body;
        console.log(req.body);
        try {
            let data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
            if (!Array.isArray(data)) {
                data = [];
            }
            data.push({ color, password });
            fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
            console.log(`Received entry: Favorite Color - ${color}, Password - ${password}`);
            res.redirect('/');
        }catch (err) {
            res.render('error.ejs', { title: 'Error', message: err });
            console.error('Error writing to data.json:', err);
        }
    })

    app.get('/view', (req, res) => {
        var data = JSON.parse(fs.readFileSync('data.json', 'utf8'));
        res.render('view.ejs', { title: 'View Entries', entries: data });
    });