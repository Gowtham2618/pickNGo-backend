const jwt = require('jsonwebtoken');

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");
const refreshSecret = process.env.REFRESH_SECRET;

const generateRefreshToken = async (req, res, next) => {
    try {
        const { userDetails } = req?.body;

        const refreshToken = jwt.sign(userDetails, refreshSecret, { expiresIn: 86400 });

        if(!refreshToken) {
            return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.REFRESH_TOKEN_FAILED ?? "");
        }
        req.body["refreshToken"] = refreshToken;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { generateRefreshToken }