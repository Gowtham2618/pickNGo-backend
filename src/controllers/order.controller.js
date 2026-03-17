const socket = require("../socket/socket.io");
const mongoose = require("mongoose");

const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

const orderService = require("../services/order.service");

class OrderController {

    placeOrder = async (req, res) => {
        try {
            let { nearbyStores, ...payload } = req?.body;
            const io = socket.getIO();

            const isPlaced = await orderService.placeOrder({ ...payload });
            if (!isPlaced) {
                return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, MESSAGES?.ORDER_PLACEMENT_FAILED, { ...payload });
            }

            nearbyStores.forEach(store => {
                io.to(store.storeId.toString()).emit("newOrder", {
                    orderId: isPlaced._id,
                    storeId: store.storeId,
                    message: "A new order has been placed near your store. Please check the order details."
                });
            });

            return RESPONSES.success(req, res, STATUS?.CREATED, MESSAGES?.ORDER_PLACED, isPlaced._doc);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, `${error}`);
        };
    };

    getOrderDetails = async (req, res) => {
        try {
            const { orderId } = req?.params;
            const whereCondition = {
                _id: new mongoose.Types.ObjectId(orderId),
                isActive: true
            };
            const results = await orderService.getOrderDetails(whereCondition);
            if (!results) {
                return RESPONSES.error(req, res, STATUS?.NOT_FOUND, MESSAGES?.ORDER_NOT_FOUND, { orderId: orderId });
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.ORDER_FETCHED, results);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, `${error}`);
        };
    };

    acceptOrRejectOrder = async (req, res) => {
        try {
            const io = socket.getIO();
            const { orderId } = req?.params;
            const { orderDetails, status, storeId, storeDetails } = req?.body;

            const whereCondition = {
                _id: new mongoose.Types.ObjectId(orderId),
                status: "Pending",
                isActive: true
            };

            const updateObj = {
                status: status === "accept" ? "Accepted" : "Rejected",
                storeId: storeId,
                storeEmail: storeDetails?.email ?? "",
                storeName: storeDetails?.storeName ?? "",
                storePhoneNumber: storeDetails?.phoneNumber ?? "",
            };

            const isUpdated = await orderService.acceptOrRejectOrder(whereCondition, updateObj);
            if (!isUpdated) {
                io.to(orderDetails.userId.toString()).emit("orderTaken", {
                    orderId: orderId,
                    message: `Order already taken by another store. Please check the order details for more information.`
                });

                return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.ORDER_ALREADY_TAKEN, { orderId: orderId });
            }
            else {

                io.to(orderDetails.userId.toString()).emit("orderStatusUpdate", {
                    orderId: orderId,
                    message: `Your order has been ${status === "accept" ? "accepted" : "rejected"} by the store.`
                });
            }



            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.ORDER_UPDATED, isUpdated._doc);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, `${error}`);
        };
    };
}

module.exports = new OrderController();