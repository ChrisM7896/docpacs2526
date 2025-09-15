const express = require('express');
const fs = require('fs');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/view', (req, res) => {
    const data = JSON.parse(fs.readFileSync('./data.json')).data;
    res.render("view", {orders: data});
    
});

app.get('/add', (req, res) => {
    res.render("add");
});
app.post('/add', (req, res) => {
    try{
        const data = JSON.parse(fs.readFileSync('./data.json')).data;

        const orderData = {
            form: req.body.form,
            quantity: req.body.quantity,
        }

        if(orderData.form === '') throw new Error("Form completion required")
        if(orderData.quantity > 200) throw new Error("Too many chips")
        if(orderData.quantity === '') throw new Error("Quantity Required")
        
        data.push(orderData);

        fs.writeFileSync('./data.json', JSON.stringify({data: data}));

        res.redirect('/');
    } catch (err) {
        res.render('error', {error:err.message});
    }
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})