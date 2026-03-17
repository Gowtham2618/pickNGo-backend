const router = require("express").Router();

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
    checkUserAddressExists,
} = require("../middlewares");

const userCtrl = require("../controllers/user.controller");

//User Routes:

router.post("/onboard",
    validateUserStep1,
    userDetails,
    generateRandomPassword,
    hashUserPassword,
    userCtrl.onboardUser
);

router.put("/onboard/:step/:userId",
    validateUserOnboardingStep,
    userDetails,
    checkUserAddressExists,
    userCtrl.updateUserOnboardingSteps
);

router.get("/details/:userId",
    userCtrl.getUserDetails
);

router.get("/lists",
    validateUserlists,
    userCtrl.getUserLists
);

router.put("/:userId",
    validateUserUpdateForm,
    userDetails,
    userCtrl.updateUser
);

router.delete("/:userId",
    userCtrl.deleteUser
);

module.exports = router;