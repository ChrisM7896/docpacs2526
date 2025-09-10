const { text, json } = require('body-parser');
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
    res.render('view');
});

app.post('/add', (req, res) => {
    try {
        const data = JSON.parse(fs.readFileSync('data.json')).data;
        const orderData = {
            text: req.body.text,
            password: req.body.password
        }

        if (orderData.text == "") throw new Error("Text is required");
        console.log(orderData.text);
        if (orderData.password == "") throw new Error("Password is required");
        console.log(orderData.password)
        
        data.push(orderData);
        fs.writeFileSync('data.json', JSON.stringify({ data: data }, null, 2));

        res.redirect("/")
    } catch (error) {
        res.render('error', { error: error.message });
    }


});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});





