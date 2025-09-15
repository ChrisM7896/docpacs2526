const express = require("express");
const app = express();
const port = 3000;
const fs = require("fs");

app.use(express.urlencoded({ extended: true }))

app.set('view engine', 'ejs')

app.get('/', (req, res) => {
    res.render('index');

});

app.get('/view', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data.json')).data;
    console.log(data)
    res.render('view', { orders: data });
})

app.get('/add', (req, res) => {
    res.render("add");
});

app.post('/add', (req, res) => {
    try {

        const data = JSON.parse(fs.readFileSync('./data.json')).data;

        const orderData = {
            clothing: req.body.clothing,
            quantity: req.body.quantity
        }

        if (orderData.clothing === '') throw new Error('Clothing Required');
        if (!orderData.quantity) throw new Error('Quantity Required')
        if (orderData.quantity > 2000) throw new Error('Order too large')

        data.push(orderData)

        fs.writeFileSync('./data.json', JSON.stringify({ data }));

        res.redirect('/')

    }
    catch (err) {
        res.render('error', { error: err.message })
    }

})

app.listen(port);