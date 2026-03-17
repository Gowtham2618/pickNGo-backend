const router = require("express").Router();

const {

} = require("../validators/order.validators");

const { 
    userDetails,
    getNearbyStores,
    checkIsValidOrder,
    checkStoreExists,
 } = require("../middlewares/index")

const orderCtrl = require("../controllers/order.controller");

//Order Routes:

router.post("/place-order",
    userDetails,
    getNearbyStores,
    orderCtrl.placeOrder
);

router.get("/:orderId",
    orderCtrl.getOrderDetails
);

router.put("/:orderId",
    checkIsValidOrder,
    checkStoreExists,
    orderCtrl.acceptOrRejectOrder
);

module.exports = router;
