const mongoose = require("mongoose");

const userSessionModal = require("../models/userSession.model");
const userModel = require("../models/user.model");

class AuthenticateService {
    
    isSessionExists = async (matchCondition) => {
        return await userSessionModal.findOne({ ...matchCondition }).lean();
    };

    createUserAuthenticate = async (payload) => {
        return await userModel.create({ ...payload });
    };

    createUserSession = async (payload) => {
        return await userSessionModal.create({ ...payload });
    };

    updateUserSession = async (req, userId, payload, type = null) => {
        let updateObject = {}; 

        const loginUpdate = {
            loginDetails: {
                ipAddress: req?.ip ?? "",
                device: req?.headers["user-agent"] ?? "",
            },
        };
    
        if (type !== "sms") {
            updateObject = {
                $set: {
                    sessionKey: payload?.sessionKey,
                    refreshKey: payload?.refreshKey,
                },
                $push: { ...loginUpdate }
            };
        } else {
            updateObject = {
                $push: {
                    otp: {
                        ...payload,
                    },
                }
            };
        };
    
        return await userSessionModal.updateOne(
            {
                userId: new mongoose.Types.ObjectId(userId),
                isActive: true,
            },
            {
                ...updateObject
            }
        );
    };
    
};

module.exports = new AuthenticateService();