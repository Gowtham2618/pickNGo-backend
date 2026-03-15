const mongoose = require("mongoose");

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const authService = require("../../services/authentication.service");

const checkUserSessionExists = async (req, res, next) => {
    try {
        const { userDetails } = req?.body ?? {};

        const whereCondition = {
            userId: new mongoose.Types.ObjectId(userDetails?._id),
            isActive: true
        };
        const isExists = await authService.isSessionExists(whereCondition);
        if (!isExists) {
            return RESPONSES.error(req, res, STATUS?.OK, MESSAGES?.USER_SESSION_NOT_EXISTS ?? "", whereCondition);
        }

        req.body["sessionData"] = isExists;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, 500, `${error}`);
    }
};

module.exports = { checkUserSessionExists }