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

const storeRouter = require("../controllers/store.controller");

//Store Routes:

app.post("/onboard",
    [validateStoreOnboard],
    checkStoreExists,
    storeRouter.onboardStore
);

app.get("/details/:storeId",
    storeRouter.getStoreDetails
);

app.get("/lists",
    [validateStoreLists],
    storeRouter.getStoreLists
);

app.put("/:storeId",
    storeRouter.updateStore
);

module.exports = app;