const userModel = require("../models/user.model");

class UserService {
    userDetails = async (matchCondition) => {
        return await userModel.findOne({ ...matchCondition }).lean();
    };

    createUser = async (payload) => {
        return await userModel.create({ ...payload });
    };

    userLists = async (matchCondition, skip, pageSize) => {
        return await userModel.find({ ...matchCondition }).skip(skip).limit(pageSize).lean();
    };

    usersDocumentCount = async (matchCondition) => {
        return await userModel.countDocuments({ ...matchCondition });
    };

    updateUser = async (userId, updateObj) => {
        return await userModel.findByIdAndUpdate(userId,
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
};

module.exports = new UserService();