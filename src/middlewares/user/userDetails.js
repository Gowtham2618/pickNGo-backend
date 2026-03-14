const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const userService = require("../../services/user.service");

const userDetails = async (req, res, next) => {
    try {
        let { email } = req?.body;

        let matchCondition = {
            isActive: true,
            email: String(email)
        };

        let userDetails = await userService.userDetails(matchCondition);

        if(!userDetails) {
            return RESPONSES.error(req, res, STATUS?.NOT_FOUND, MESSAGES?.USER_NOT_FOUND ?? "", { email: email });
        }

        req.body["userDetails"] = userDetails;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

module.exports = { userDetails }