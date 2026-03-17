const mongoose = require("mongoose");

const orderModel = require("../models/order.model");

class OrderService {
    placeOrder = async (payload) => {
        return await orderModel.create({ ...payload });
    };

    getOrderDetails = async (whereCondition) => {
        const [results] = await orderModel.aggregate([
            {
                $match: {
                    ...whereCondition
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    pipeline: [
                        {
                            $lookup: {
                                from: "addresses",
                                localField: "_id",
                                foreignField: "userId",
                                as: "addressDetails"
                            }
                        },
                        {
                            $unwind: {
                                path: "$addressDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                userName: { $concat: ["$firstName", " ", "$lastName"] },
                                phoneNumber: 1,
                                email: 1,
                                address: {
                                    doorNo: "$addressDetails.doorNo",
                                    buildingName: "$addressDetails.buildingName",
                                    street: "$addressDetails.street",
                                    city: "$addressDetails.city",
                                    pincode: "$addressDetails.pincode",
                                    state: "$addressDetails.state",
                                    country: "$addressDetails.country",
                                },
                            }
                        }
                    ],
                    as: "userDetails"
                }
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    userId: "$userDetails._id",
                    userName: "$userDetails.userName",
                    phoneNumber: "$userDetails.phoneNumber",
                    email: "$userDetails.email",
                    address: "$userDetails.address",
                    items: 1,
                    createdAt: 1,
                    orderStatus: "$status"
                }
            }

        ]).exec();

        return results;
    };

    acceptOrRejectOrder = async (whereCondition, updateObj) => {
        return await orderModel.findOneAndUpdate(
            { ...whereCondition },
            { $set: updateObj },
            { new: true }
        ).exec();
    };
};

module.exports = new OrderService();