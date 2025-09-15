const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/view', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data.json')).data;
    res.render('view', { orders: data }); 
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.post('/add', (req, res) => {
    try {
        const jsonFile = JSON.parse(fs.readFileSync('./data.json'));
        const data = jsonFile.data;

        const orderData = {
            flavors: Array.isArray(req.body.flavor) ? req.body.flavor : [req.body.flavor],
            drinks: req.body.Drinks,
        };

        if (!orderData.flavors || orderData.flavors.length === 0) throw new Error('Please Pick a Flavor');

        data.push(orderData);
        fs.writeFileSync('./data.json', JSON.stringify({ data: data }, null, 2));

        res.redirect('/');
    } catch (err) {
        res.render('error', { error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:3000`);
});
