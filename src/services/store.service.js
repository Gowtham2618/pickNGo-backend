const mongoose = require("mongoose");

const storeModel = require("../models/store.model");
const addressModel = require("../models/address.model");

class StoreService {
    createStore = async (payload) => {
        return await storeModel.create({ ...payload });
    };

    getStoreDetails = async (matchCondition) => {
        return await storeModel.findOne({ ...matchCondition }).lean();
    };

    getStoreLists = async (skip = 0, limit = 10, matchCondition) => {
        return await storeModel.find({ ...matchCondition }).skip(skip).limit(limit).lean();
    };

    getStoreTotalDocuments = async (matchCondition) => {
        return await storeModel.countDocuments({ ...matchCondition });
    };

    updateStoreRecord = async (storeId, updateObject) => {
        return await storeModel.findByIdAndUpdate(storeId,
            { ...updateObject },
            { new: true }
        )
    };

    getNearbyStores = async (latitude, longitude, radius) => {

        const lat = Number(latitude);
        const lng = Number(longitude);
        const maxDistance = Number(radius);

        return await addressModel.aggregate([
            {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [lng, lat]
                    },
                    distanceField: "distance",
                    maxDistance: maxDistance,
                    spherical: true,
                    query: {               // ✅ filter early
                        userType: "retailer",
                        isActive: true
                    }
                }
            },

            {
                $lookup: {
                    from: "stores",
                    localField: "userId",      // ✅ faster than $expr
                    foreignField: "userId",
                    pipeline: [
                        {
                            $match: {
                                isActive: true
                            }
                        },
                        {
                            $project: {
                                _id: 1,
                                storeName: 1,
                                phoneNumber: 1,
                                userId: 1
                            }
                        }
                    ],
                    as: "storeDetails"
                }
            },

            { $unwind: "$storeDetails" },

            {
                $project: {
                    _id: 0,
                    storeId: "$storeDetails._id",
                    storeName: "$storeDetails.storeName",
                    phoneNumber: "$storeDetails.phoneNumber",
                    userId: "$storeDetails.userId",

                    address: {
                        doorNo: "$doorNo",
                        buildingName: "$buildingName",
                        street: "$street",
                        city: "$city",
                        pincode: "$pincode",
                        state: "$state",
                        country: "$country"
                    },

                    location: "$location",
                    distance: 1
                }
            },

            {
                $limit: 10   // ✅ send order to only nearest stores
            }
        ]);
    };
};

module.exports = new StoreService();