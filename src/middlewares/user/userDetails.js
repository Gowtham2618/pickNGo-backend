const mongoose = require("mongoose");

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const userService = require("../../services/user.service");
const onboardingPath = "/api/v1/user/onboard";
const userDetails = async (req, res, next) => {
    try {
        const { email = null, phoneNumber = null } = req?.body;
        const { type, userId = null } = req?.params;

        const isEndpointExists = req?.originalUrl == onboardingPath;

        let matchCondition = {
            isActive: true
        };

        if (userId) {
            matchCondition = {
                ...matchCondition,
                _id: new mongoose.Types.ObjectId(userId)
            };
        }

        if (email) {
            matchCondition = {
                ...matchCondition,
                email: String(email).toLowerCase()
            };
        }

        if (type === "sms") {
            matchCondition = {
                ...matchCondition,
                phoneNumber: String(phoneNumber)
            };
        }

        const userDetails = await userService.userDetails(matchCondition);

        // If the request is for onboarding and user details does not exist, allow to proceed with user creation
        if (isEndpointExists && !userDetails) {
            return next();
        }
        else if (isEndpointExists && userDetails) {
            return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.USER_EXISTS ?? "", { email: email });
        }


        // For other endpoints, if user details does not exist, return error response
        if (!userDetails) {
            return RESPONSES.error(req, res, STATUS?.NOT_FOUND, MESSAGES?.USER_NOT_FOUND ?? "", req?.body);
        }

        // Attach user details to request body for further use in the request lifecycle
        req.body["userDetails"] = userDetails;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { userDetails }