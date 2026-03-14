const express = require('express');
const app = express();
const cors = require("cors");

const corsOptions = require("./src/config/cors");

require('dotenv').config();

const PORT = process.env.PORT || 3000; // Default port if not specified in environment variables

app.use(cors(corsOptions));

//base url
app.use('/api/v1', require('./app'));

app.use((req, res, next) => {
    let { originalUrl } = req;
    res.status(404).json({
        error: originalUrl,
        message: 'The requested endpoint does not exist'
    });
});

app.listen(PORT, () => {
    console.log(`Server starts at********** ${PORT}`);
});
