const express = require('express');
const { error } = require('console')
const app = express();
const port = 3000;
const fs = require('fs');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index.ejs', { title: 'Home', message: 'Welcome!' });
});

app.get('/view', (req, res) => {
    try {
        const fileData = JSON.parse(fs.readFileSync('data.json'));
        const foods = fileData.data || [];
        res.render('view', { title: 'View all entries', foods: foods });
    }
    catch (error) {
        res.render('error', { error: error.message });
    }
})

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data.json')).data;
        const foodData = {
            food: req.body.food,
            healthy: req.body.healthy
        }
        data.push(foodData);
        fs.writeFileSync('data.json', JSON.stringify({ data: data }));
        res.redirect('/');
    }
    catch (error) {
        res.render('error', { error: error.message });
    }
});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});