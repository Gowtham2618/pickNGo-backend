const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const storeService = require("../../services/store.service");

const checkStoreExists = async (req, res, next) => {
    try {
        const { phoneNumber, storeName } = req?.body ?? {};
        const skip = 0, limit = 1;

        const matchCondition = {
            storeName: storeName,
            phoneNumber: phoneNumber,
            isActive: true
        };
        const isExists = await storeService.getStoreLists(skip, limit, matchCondition);
        if (!isExists.length) {
            return next();
        }

        return RESPONSES.error(req, res, STATUS?.OK, MESSAGES?.STORE_EXISTS ?? "", matchCondition);
    }
    catch (error) {
        return RESPONSES.error(req, res, 500, `${error}`);
    }
};

module.exports = { checkStoreExists }