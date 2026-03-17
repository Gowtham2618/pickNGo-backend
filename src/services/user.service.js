const mongoose = require("mongoose");

const userModel = require("../models/user.model");
const addressModel = require("../models/address.model");

class UserService {
    userDetails = async (whereCondition) => {
        const pipeline = [
            { $match: { ...whereCondition } },
            {
                $lookup: {
                    from: "addresses",
                    let: { userId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$userId", "$$userId"] },
                                        { $eq: ["$userType", "customer"] },
                                        { $eq: ["$isActive", true] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "address",
                },
            },
            { $unwind: { path: "$address", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    fullName: { $concat: ["$firstName", " ", "$lastName"] },
                    email: 1,
                    phoneNumber: 1,
                    role: 1,
                    onboarding: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    address: {
                        _id: "$address._id",
                        doorNo: "$address.doorNo",
                        buildingName: "$address.buildingName",
                        street: "$address.street",
                        city: "$address.city",
                        state: "$address.state",
                        country: "$address.country",
                        pincode: "$address.pincode",
                        location: "$address.location",
                    },
                },
            }
        ];

        const [user] = await userModel.aggregate(pipeline).exec();
        return user || null;
    };

    createUser = async (payload) => {
        return await userModel.create({ ...payload });
    };

    userLists = async (whereCondition, skip, limit) => {
        const { city, ...userMatch } = whereCondition || {};

        const addressMatch = {
            $expr: {
                $and: [
                    { $eq: ["$userId", "$$userId"] },
                    { $eq: ["$userType", "customer"] },
                    { $eq: ["$isActive", true] },
                ],
            },
        };

        if (city) {
            addressMatch.$expr.$and.push({
                $regexMatch: {
                    input: "$city",
                    regex: city.trim(),
                    options: "i",
                },
            });
        }

        const pipeline = [
            {
                $facet: {
                    paginatedResults: [
                        { $sort: { createdAt: -1 } },
                        { $match: { ...userMatch } },
                        {
                            $lookup: {
                                from: "addresses",
                                let: { userId: "$_id" },
                                pipeline: [
                                    { $match: addressMatch },
                                ],
                                as: "address",
                            },
                        },
                        {
                            $unwind: { path: "$address", preserveNullAndEmptyArrays: true }
                        },
                        ...(city ? [{ $match: { address: { $ne: null } } }] : []),
                        {
                            $project: {
                                _id: 1,
                                fullName: { $concat: ["$firstName", " ", "$lastName"] },
                                email: 1,
                                phoneNumber: 1,
                                role: 1,
                                onboarding: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                address: {
                                    _id: "$address._id",
                                    doorNo: "$address.doorNo",
                                    buildingName: "$address.buildingName",
                                    street: "$address.street",
                                    city: "$address.city",
                                    state: "$address.state",
                                    country: "$address.country",
                                    pincode: "$address.pincode",
                                    location: "$address.location",
                                },
                            }
                        },
                        { $skip: skip },
                        { $limit: limit },
                    ],
                    totalCount: [
                        { $match: { ...userMatch } },
                        { $count: "count" },
                    ],
                },
            },
        ];

        const [results] = await userModel.aggregate(pipeline).exec();
        return {
            results: results?.paginatedResults || [],
            totalCount: results?.totalCount[0]?.count || 0,
        };
    };

    updateUserOnboardingSteps = async (userId, updateObj) => {
        return await userModel.findByIdAndUpdate(
            userId,
            { ...updateObj },
            { new: true }
        );
    };

    updateUserAddressAndLocation = async (userId, updateObj) => {

        return await addressModel.findOneAndUpdate(
            {
                userId: new mongoose.Types.ObjectId(userId),
                isActive: true,
            },
            { ...updateObj },
            { new: true }
        );
    };

    deleteUser = async (userId, updateObj) => {
        return await userModel.findByIdAndUpdate(userId,
            {
                ...updateObj
            }
        );
    };

    createUserAddress = async (payload) => {
        return await addressModel.create({ ...payload });
    };

    isAddressExists = async (whereCondition) => {
        return await addressModel.findOne({ ...whereCondition }).lean();
    };
};

module.exports = new UserService();