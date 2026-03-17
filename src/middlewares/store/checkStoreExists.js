const mongoose = require("mongoose");

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const storeService = require("../../services/store.service");
const storeOnboardingPath = "/api/v1/store/onboard";

const checkStoreExists = async (req, res, next) => {
    try {
        const isEndpointExists = req?.originalUrl == storeOnboardingPath;
        const { phoneNumber, storeName, storeId } = req?.body ?? {};
        
        const matchCondition = {
            isActive: true
        };

        if(phoneNumber && storeName) {
            matchCondition.phoneNumber = phoneNumber;
            matchCondition.storeName = storeName;
        }

        if(storeId) {
            matchCondition._id = new mongoose.Types.ObjectId(storeId);
        }
        const isExists = await storeService.getStoreDetails(matchCondition);
        if (!isExists && isEndpointExists) { // If store does not exist and the request is for onboarding, allow to proceed with store creation
            return next();
        }
        else if (isExists && isEndpointExists) { // If store exists and the request is for onboarding, return error response
            return RESPONSES.error(req, res, STATUS?.OK, MESSAGES?.STORE_EXISTS ?? "", matchCondition);
        }

        req.body["storeDetails"] = isExists; 
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, 500, `${error}`);
    }
};

module.exports = { checkStoreExists }