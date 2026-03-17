const express = require("express");
const cors = require("cors");

const corsOptions = require("./src/config/cors");

// initialize db
require("./src/config/database");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));

// routes
const AuthRouter = require("./src/routes/authenticate.router");
const UserRouter = require("./src/routes/user.router");
const StoreRouter = require("./src/routes/store.router");
const OrderRouter = require("./src/routes/order.router");

app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/store", StoreRouter);
app.use("/order", OrderRouter);

// 404
app.use((req, res) => {
    const { originalUrl } = req;

    res.status(404).json({
        error: originalUrl,
        message: "The requested endpoint does not exist",
    });
});

module.exports = app;