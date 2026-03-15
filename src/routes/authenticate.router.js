const router = require("express").Router();

const {
    validateLogin,
    validateOTPLogin,
    validateVerifyOTP
} = require("../validators/authenticate.validators");

const {
    checkUserSessionExists,
    compareUserPassword,
    generateAccessToken,
    generateRefreshToken,
    createUserSession,
    userDetails,
    generateRandomOTP,
    verifyOTP,
} = require("../middlewares");

const authenticateCtrl = require("../controllers/authentication.controller");

router.post("/login",
    validateLogin,
    userDetails,
    compareUserPassword,
    generateAccessToken,
    generateRefreshToken,
    createUserSession,
    authenticateCtrl.userLogin
);

router.post("/login/:type",
    validateOTPLogin,
    userDetails,
    generateRandomOTP,
    createUserSession,
    authenticateCtrl.userOTPLogin
);

router.post("/verify-otp",
    validateVerifyOTP,
    userDetails,
    checkUserSessionExists,
    verifyOTP,
    generateAccessToken,
    generateRefreshToken,
    createUserSession,
    authenticateCtrl.updateSessionOnOTPVerification
);

router.put("/reset-password",
    authenticateCtrl.userPasswordReset
);

router.put("/forget-password",
    authenticateCtrl.forgetPassword
);

module.exports = router;