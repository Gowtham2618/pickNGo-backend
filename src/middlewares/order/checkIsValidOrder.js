const mongoose = require("mongoose");

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const orderService = require("../../services/order.service");

const checkIsValidOrder = async (req, res, next) => {
    try {
        const { orderId } = req?.params ?? {};
        
        const matchCondition = {
            _id: new mongoose.Types.ObjectId(orderId),
            isActive: true
        };
        const isOrderExists = await orderService.getOrderDetails(matchCondition);
        if (!isOrderExists) {
            return RESPONSES.error(req, res, STATUS?.NOT_FOUND, MESSAGES?.ORDER_NOT_FOUND ?? "", { orderId: orderId });
        }

        req.body["orderDetails"] = isOrderExists;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, 500, `${error}`);
    }
};

module.exports = { checkIsValidOrder }