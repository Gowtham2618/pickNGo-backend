const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

const userService = require("../services/user.service");
const storeService = require("../services/store.service");
const { default: mongoose } = require("mongoose");

class StoreController {
    onboardStore = async (req, res) => {
        try {
            let payload = req?.body;

            const isUserExists = await userService.userDetails({ _id: new mongoose.Types.ObjectId(payload?.userId) });
            if (!isUserExists) {
                return RESPONSES.error(req, res, STATUS.NOT_FOUND, "User not exists !", {
                    userId: payload?.userId
                });
            };

            // if (payload?.isSameAsUserAddress) {
            //     payload = {
            //         ...payload,
            //         address: isUserExists?.address,
            //         location: isUserExists?.location
            //     }
            // }

            const isCreated = await storeService.createStore({ ...payload });
            if (!isCreated) {
                return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, MESSAGES?.STORE_CREATION_FAILED, { ...payload });
            }

            return RESPONSES.success(req, res, STATUS?.CREATED, MESSAGES?.STORE_CREATED, isCreated._doc);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, `${error}`);
        };
    };


    getStoreDetails = async (req, res) => {
        try {
            const { storeId } = req?.params;
            const matchCondition = {
                isActive: true,
                _id: new mongoose.Types.ObjectId(storeId)
            };

            if (!mongoose.Types.ObjectId.isValid(storeId)) {
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.INVALID_STORE_ID);
            }

            const results = await storeService.getStoreDetails(matchCondition);

            if (!results) {
                return RESPONSES.error(req, res, STATUS?.NOT_FOUND, MESSAGES?.STORE_NOT_FOUND, { storeId: storeId });
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.STORE_FETCHED, results);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        };
    };

    getStoreLists = async (req, res) => {
        try {
            let { page = 1, pageSize = 10, storeName, userId } = req?.query;
            page = Number(page);
            pageSize = Number(pageSize);

            const skip = (page - 1) * pageSize;

            const matchCondition = {
                isActive: true,
            };

            if (storeName) matchCondition["storeName"] = storeName;
            if (userId) matchCondition["userId"] = new mongoose.Types.ObjectId(userId);

            const [storeLists, totalCount] = await Promise.all([
                storeService.getStoreLists(skip, pageSize, matchCondition),
                storeService.getStoreTotalDocuments(matchCondition),
            ]);

            const response = {
                results: storeLists ?? [],
                page,
                pageSize,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize)
            }

            if (!storeLists) {
                return RESPONSES.error(req, res, STATUS?.NOT_FOUND, MESSAGES?.STORE_NOT_FOUND, response);
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.STORE_FETCHED, response);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        };
    };

    updateStore = async (req, res) => {
        try {
            const updatePayload = req?.body ?? {};
            const { storeId } = req?.params;
            if (!mongoose.Types.ObjectId.isValid(storeId)) {
                return RESPONSES.error(req, res, STATUS.BAD_REQUEST, MESSAGES?.INVALID_STORE_ID);
            }

            const isRecordExists = await storeService.getStoreDetails(storeId);
            if (!isRecordExists) {
                return RESPONSES.error(req, res, STATUS.NOT_FOUND, MESSAGES?.STORE_NOT_FOUND, { storeId: storeId });
            }

            const isRecordUpdated = await storeService.updateStoreRecord(storeId, updatePayload);
            if (!isRecordUpdated) {
                return RESPONSES.error(req, res, STATUS.BAD_REQUEST, MESSAGES?.STORE_UPDATE_FAILED, { storeId: storeId, ...updatePayload });
            }

            return RESPONSES.success(req, res, STATUS.OK, MESSAGES?.STORE_UPDATED, isRecordUpdated?._doc);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, `${error}`);
        };
    };
};

module.exports = new StoreController();