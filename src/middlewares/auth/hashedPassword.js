const bcrypt = require('bcryptjs');
const saltRounds = 10;

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const hashUserPassword = async (req, res, next) => {
    try {
        const { password } = req?.body;
        console.log("🚀 ~ hashUserPassword ~ password:", password)
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        console.log("🚀 ~ hashUserPassword ~ hashedPassword:", hashedPassword)
        if (!hashedPassword) {
            return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.PASSWORD_HASHING_FAILED ?? "");
        }

        req.body["password"] = hashedPassword;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { hashUserPassword }