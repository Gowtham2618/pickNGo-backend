const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const {
    validateUserStep1,
    validateUserOnboardingStep,
    validateUserUpdateForm,
    validateUserlists,
} = require("../validators/user.validators");

const {
    generateRandomPassword,
    hashUserPassword,
    userDetails,
} = require("../middlewares");

const userCtrl = require("../controllers/user.controller");

//User Routes:

app.post("/onboard",
    validateUserStep1,
    userDetails,
    generateRandomPassword,
    hashUserPassword,
    userCtrl.onboardUser
);

app.post("/onboard/:step/:userId",
    [validateUserOnboardingStep],
    userCtrl.updateUserOnboardingSteps
);

app.get("/details/:userId",
    userCtrl.getUserDetails
);

app.get("/lists",
    [validateUserlists],
    userCtrl.getUserLists
);

app.put("/:userId",
    [validateUserUpdateForm],
    userCtrl.updateUser
);

app.delete("/:userId",
    userCtrl.deleteUser
);

module.exports = app;