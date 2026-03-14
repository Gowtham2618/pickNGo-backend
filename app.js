const express = require('express');
const app = express();

// Initialize the database connection
require("./src/config/database");

const AuthRouter = require("./src/routes/authenticate.router");
const StoreRouter = require("./src/routes/store.router");

app.use('/auth', AuthRouter);
app.use('/store', StoreRouter);

module.exports = app;   