const mongoose = require("mongoose");

const RESPONSES = require("../../constants/response");
const MESSAGES = require("../../constants/constantMessage");
const STATUS = require("../../constants/statusCodes");

const userService = require("../../services/user.service");

const checkUserAddressExists = async (req, res, next) => {
    try {
        const { step, userId } = req?.params ?? {};
        const { userDetails, ...payload } = req?.body ?? {};

        const whereCondition = {
            userId: new mongoose.Types.ObjectId(userId),
            isActive: true
        };
        const isExists = await userService.isAddressExists(whereCondition);
        if (!isExists) {
            payload = {
                ...payload,
                userId: userId,
                userType: userDetails?.userType
            }
            const isCreated = await userService.createUserAddress(payload);
            if (!isCreated) {
                return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, MESSAGES?.USER_ONBOARDING_STEP_UPDATE_FAILED?.replace("{step}", step) ?? "", payload);
            }
            
            const isOnboardStepUpdated = await userService.updateUserOnboardingSteps(userDetails?._id, { onboarding: { ...userDetails?.onboarding, [`step${step}`]: "completed" } });
            if (!isOnboardStepUpdated) {
                return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, MESSAGES?.ONBOARD_STEP_UPDATE_FAILED, payload);
            }

            return RESPONSES.success(req, res, STATUS.CREATED, MESSAGES?.USER_ONBOARDING_STEP_UPDATE_SUCCESS?.replace("{step}", step) ?? "", isCreated._doc);
        }

        req.body["addressData"] = isExists;
        next();
    }
    catch (error) {
        return RESPONSES.error(req, res, 500, `${error}`);
    }
};

module.exports = { checkUserAddressExists }