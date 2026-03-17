const mongoose = require("mongoose");
const moment = require("moment");
const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const authService = require("../../services/authentication.service");
const { generateRandomOTP } = require("./generateRandomOTP");


const createUserSession = async (req, res, next) => {
    try {
        const { accessToken, refreshToken, userDetails, otp = null } = req?.body;
        const { type } = req?.params; //only for otp login
        let sessionObj = {};
        
        const whereCondition = {
            userId: new mongoose.Types.ObjectId(userDetails._id),
            isActive: true
        };

        if (type === "sms") { // otp login for sms
            sessionObj = {
                userId: new mongoose.Types.ObjectId(userDetails?._id),
                phoneNumber: userDetails?.phoneNumber,
                otp: [{
                    code: otp || generateRandomOTP(req, res, next),
                    expiresAt: moment().utc().add(5, 'minutes').toDate()
                }],
            };
        }
        else { // default login with email and password
            sessionObj = {
                userId: new mongoose.Types.ObjectId(userDetails?._id),
                phoneNumber: userDetails?.phoneNumber,
                sessionKey: accessToken,
                refreshKey: refreshToken,
                loginDetails: [{
                    ipAddress: req?.ip ?? "",
                    device: req?.headers["user-agent"] ?? "",
                }]
            };
        }

        const isSessionExists = await authService.isSessionExists(whereCondition);
        const { loginDetails, ...rest } = sessionObj;

        if (!isSessionExists) { // If session does not exist, create new session
            const isSessionCreated = await authService.createUserSession(sessionObj);
            if (!isSessionCreated) {
                return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, MESSAGES?.USER_SESSION_CREATION_FAILED ?? "");
            }

            const response = {
                sessionId: isSessionCreated._id,
                email: userDetails?.email,
                ...rest
            };
            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_LOGGED_IN ?? "", response);
        }
        else { // If session already exists, update the session in next middleware
            const response = {
                sessionId: isSessionExists._id,
                email: userDetails?.email,
                ...rest
            }
            req.body["sessionObj"] = response;
            next();
        }
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { createUserSession }