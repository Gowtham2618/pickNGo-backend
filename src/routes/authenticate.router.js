const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const {
    validateLogin,
    validateOTPLogin,
    validateVerifyOTP,
} = require("../validators/authenticate.validators");

const { generateAccessToken,generateRefreshToken,userDetails } = require("../middlewares/index");
const authenticate = require("../controllers/authentication.controller");

//Authenticate Routes:

app.post("/login",
    [validateLogin],
    userDetails,
    generateAccessToken,
    generateRefreshToken,
    authenticate.userLogin
);

app.post("/login/:type",
    [validateOTPLogin],
    authenticate.userOTPLogin
);

app.post("/verify-otp",
    [validateVerifyOTP],
    authenticate.verifyOTP
);

app.put("/reset/password",
    authenticate.userPasswordReset
);

app.put("/forget/password",
    authenticate.forgetPassword
);

module.exports = app;