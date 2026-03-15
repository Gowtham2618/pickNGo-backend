const express = require("express");
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize database connection
require("./src/config/database");

// Routes
const AuthRouter = require("./src/routes/authenticate.router");
const UserRouter = require("./src/routes/user.router");
const StoreRouter = require("./src/routes/store.router");

app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/store", StoreRouter);

module.exports = app;