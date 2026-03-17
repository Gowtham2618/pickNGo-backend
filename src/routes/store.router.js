const router = require("express").Router();

const {
    validateStoreOnboard,
    validateStoreLists,
} = require("../validators/store.validators");

const { checkStoreExists } = require("../middlewares/index")

const storeCtrl = require("../controllers/store.controller");

//Store Routes:

router.post("/onboard",
    // validateStoreOnboard,
    checkStoreExists,
    storeCtrl.onboardStore
);

router.get("/details/:storeId",
    storeCtrl.getStoreDetails
);

router.get("/lists",
    validateStoreLists,
    storeCtrl.getStoreLists
);

router.put("/:storeId",
    storeCtrl.updateStore
);

module.exports = router;
