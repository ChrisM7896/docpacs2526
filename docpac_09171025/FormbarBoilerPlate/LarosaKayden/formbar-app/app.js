//setup
const express = require('express');
const app = express();

require('dotenv').config();

app.get('/', (req, res) => {
    res.send('helo');
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
