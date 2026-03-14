const jwt = require('jsonwebtoken');

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const jwtSecret = process.env.SECRET;

const generateAccessToken = async (req, res, next) => {
    try {
        const { userDetails } = req?.body;

        const accessToken = jwt.sign(userDetails, jwtSecret, { expiresIn: 86400 });

        if(!accessToken) {
            return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.ACCESS_TOKEN_FAILED ?? "");
        }
        req.body["accessToken"] = accessToken;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { generateAccessToken }