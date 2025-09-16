const { entry, json } = require('body-parser');
const express = require('express');
const app = express();
const port = 3000;
const fs = require('fs');

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/add', (req, res) => {
    res.render('add');
});

app.get('/view', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data.json')).data;
    console.log(data)
    res.render('view', { orders: data });
});

app.post('/add', (req, res) => {
    try {
        // Ensure data.json exists and has a valid structure
        let data = [];
        if (fs.existsSync('data.json')) {
            const fileContent = fs.readFileSync('data.json', 'utf8');
            if (fileContent) {
                const parsed = JSON.parse(fileContent);
                data = Array.isArray(parsed.data) ? parsed.data : [];
            }
        }

        const orderData = {
            title: req.body.title,
            entry: req.body.entry,
            date: req.body.date
        };

        if (orderData.title === "") throw new Error("Title is required");
        console.log(orderData.title);
        if (orderData.entry === "") throw new Error("entry is required");
        console.log(orderData.entry);
        if (orderData.date === "") throw new Error("Date is required");
        console.log(orderData.date)

        data.push(orderData);

        fs.writeFileSync('data.json', JSON.stringify({ data }));

        res.redirect("/")
    } catch (error) {
        res.render('error', { error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});





