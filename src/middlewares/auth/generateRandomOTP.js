const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const OTP_LENGTH = process.env.OTP_LENGTH || 4;

const generateRandomOTP = (req, res, next) => {
    const otp = Array.from({ length: OTP_LENGTH }, () => Math.floor(Math.random() * 10)).join("");
    if(!otp) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, MESSAGES?.OTP_GENERATION_FAILED ?? "");
    }
    req.body["otp"] = otp;
    next();
};

module.exports = { generateRandomOTP };
