const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index')
});

app.get('/add', (req, res) => {
    res.render('add.ejs')
});

app.post('/add', (req, res) => {
    const {text} = req.body;
    if (!text) {
        return res.render('error.ejs');
    }
    try {
        const fileData = fs.readFileSync('data.json');
        let json = JSON.parse(fileData);
        json.data.push(req.body);
        fs.writeFileSync('data.json', JSON.stringify(json, null, 2));
        res.redirect('/');
    } catch (error) {
        res.render('error.ejs');
    }
});

app.get('/view', (req, res) => {
    try {
        const fileData = fs.readFileSync('data.json', 'utf8');
        const json = JSON.parse(fileData);
        res.render('view.ejs', { foods: json.data });
    } catch (error) {
        res.render('error.ejs');
    }
});