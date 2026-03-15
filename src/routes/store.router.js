const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const {
    validateStoreOnboard,
    validateStoreLists,
} = require("../validators/store.validators");

const { checkStoreExists } = require("../middlewares/index")

const storeCtrl = require("../controllers/store.controller");

//Store Routes:

app.post("/onboard",
    [validateStoreOnboard],
    checkStoreExists,
    storeCtrl.onboardStore
);

app.get("/details/:storeId",
    storeCtrl.getStoreDetails
);

app.get("/lists",
    [validateStoreLists],
    storeCtrl.getStoreLists
);

app.put("/:storeId",
    storeCtrl.updateStore
);

module.exports = app;