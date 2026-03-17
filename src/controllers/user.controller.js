const mongoose = require("mongoose");

const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

const userService = require("../services/user.service");

class UserController {


    // Create New User
    onboardUser = async (req, res) => {
        try {
            const payload = req.body;
            const createdUser = await userService.createUser(payload);
            if (!createdUser) {
                return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.USER_CREATION_FAILED ?? "");
            }

            return RESPONSES.success(req, res, STATUS?.CREATED, MESSAGES?.USER_CREATED ?? "", createdUser._doc);

        } catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };


    // 2. Update Onboarding Step
    updateUserOnboardingSteps = async (req, res) => {
        try {
            const { userDetails, addressData, ...payload } = req.body;
            const { step, userId } = req.params;
            const updated = await userService.updateUserAddressAndLocation(userId, payload);
            if (!updated) {
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.USER_ONBOARDING_STEP_UPDATE_FAILED.replace("{step}", step) ?? "");
            }

            const isOnboardStepUpdated = await userService.updateUserOnboardingSteps(userDetails?._id, { onboarding: { ...userDetails?.onboarding, [`step${step}`]: "completed" } });
            if (!isOnboardStepUpdated) {
                return RESPONSES.error(req, res, STATUS.INTERNAL_SERVER_ERROR, MESSAGES?.ONBOARD_STEP_UPDATE_FAILED, payload);
            }
            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_ONBOARDING_STEP_UPDATE_SUCCESS.replace("{step}", step) ?? "", updated._doc);

        } catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };

    // 3. Update User Profile
    updateUser = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.INVALID_USER_ID ?? "");
            }

            const updatePayload = req?.body;

            const updated = await userService.updateUserOnboardingSteps(userId, updatePayload);

            if (!updated) {
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.USER_UPDATE_FAILED ?? "", updatePayload);
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_UPDATED ?? "", updated._doc);

        } catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };

    // 4. Get User Details
    getUserDetails = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.INVALID_USER_ID ?? "");
            }

            const whereCondition = {
                _id: new mongoose.Types.ObjectId(userId),
                isActive: true
            };

            const user = await userService.userDetails(whereCondition);

            if (!user) {
                return RESPONSES.error(req, res, STATUS?.NOT_FOUND, MESSAGES?.USER_NOT_FOUND ?? "", { userId });
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_DETAILS_FETCHED ?? "", user);

        } catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };


    // 5. Get User Lists (Filter + Pagination)
    getUserLists = async (req, res) => {
        try {
            const { city, phoneNumber, role, email, name, page = 1, pageSize = 10 } = req?.query;

            const skip = (Number(page) - 1) * Number(pageSize);
            const limit = Number(pageSize);
            const matchCondition = { isActive: true };

            if (city) matchCondition["city"] = city.trim();
            if (phoneNumber) matchCondition["phoneNumber"] = new RegExp(phoneNumber.trim(), "i");
            if (role) matchCondition["role"] = role.trim();
            if (email) matchCondition["email"] = email.trim();
            if (name) {
                const regex = new RegExp(name.trim(), "i");
                matchCondition["$or"] = [
                    { firstName: regex },
                    { lastName: regex },
                ];
            }
            console.log("🚀 ~ UserController ~ matchCondition:", matchCondition)
            const { results: users, totalCount } = await userService.userLists(matchCondition, skip, limit);

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_LISTS_FETCHED ?? "", {
                results: users,
                page: Number(page),
                pageSize: Number(limit),
                totalCount,
                totalPages: Math.ceil(totalCount / limit)
            });

        } catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    // 6. Delete User (Soft Delete)
    deleteUser = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.INVALID_USER_ID ?? "");
            }

            const isDeleted = await userService.deleteUser(userId, { isActive: false });

            if (!isDeleted) {
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, MESSAGES?.USER_DELETE_FAILED ?? "", { userId });
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_DELETED ?? "", isDeleted);

        } catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };
}

module.exports = new UserController();
