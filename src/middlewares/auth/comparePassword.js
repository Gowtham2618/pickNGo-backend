const bcrypt = require('bcryptjs');

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const compareUserPassword = async (req, res, next) => {
    try {
        const { password,userDetails } = req?.body;

        const isMatched = bcrypt.compareSync(password, userDetails?.password);

        if(!isMatched) {
            return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.INVALID_CREDENTIALS ?? "");
        }

        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { compareUserPassword }