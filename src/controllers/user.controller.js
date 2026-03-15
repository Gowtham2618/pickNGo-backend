const mongoose = require("mongoose");

const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

const userService = require("../services/user.service");

class UserController {

    // -------------------------------------------------------------
    // 1. Create New User
    // -------------------------------------------------------------
    onboardUser = async (req, res) => {
        try {
            const payload = req.body;
            console.log("🚀 ~ UserController ~ payload:", payload)

            const createdUser = await userService.createUser(payload);
            if (!createdUser) {
                return RESPONSES.error(req, res, STATUS?.CONFLICT, MESSAGES?.USER_CREATION_FAILED ?? "");
            }

            return RESPONSES.success(req, res, STATUS?.CREATED, MESSAGES?.USER_CREATED ?? "", createdUser._doc);

        } catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };

    // -------------------------------------------------------------
    // 2. Update Onboarding Step
    // -------------------------------------------------------------
    updateUserOnboardingSteps = async (req, res) => {
        try {
            const payload = req.body;
            const { step, userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return RESPONSES.error(req, res, 400, "Invalid User ID");
            }

            const user = await userService.userDetails({
                _id: userId,
                isActive: true
            });

            if (!user) {
                return RESPONSES.error(req, res, 404, "User does not exist!", { userId });
            }

            payload[`step${step}`] = "completed";

            const updated = await userService.updateUser(userId, payload);
            if (!updated) {
                return RESPONSES.error(req, res, 400, "Failed to update user!", payload);
            }

            return RESPONSES.success(req, res, 200, "User updated successfully!", updated._doc);

        } catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    // -------------------------------------------------------------
    // 3. Update User Profile
    // -------------------------------------------------------------
    updateUser = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return RESPONSES.error(req, res, 400, "Invalid User ID");
            }

            const updatePayload = req.body;

            const user = await userService.userDetails({
                _id: userId,
                isActive: true
            });

            if (!user) {
                return RESPONSES.error(req, res, 404, "User does not exist!", { userId });
            }

            const updated = await userService.updateUser(userId, updatePayload);

            if (!updated) {
                return RESPONSES.error(req, res, 400, "Failed to update profile!", updatePayload);
            }

            return RESPONSES.success(req, res, 200, "Profile updated!", updated._doc);

        } catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    // -------------------------------------------------------------
    // 4. Get User Details
    // -------------------------------------------------------------
    getUserDetails = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return RESPONSES.error(req, res, 400, "Invalid User ID");
            }

            const user = await userService.userDetails({
                _id: userId,
                isActive: true
            });

            if (!user) {
                return RESPONSES.error(req, res, 404, "User not found!", { userId });
            }

            return RESPONSES.success(req, res, 200, "Fetched user details!", user);

        } catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    // -------------------------------------------------------------
    // 5. Get User Lists (Filter + Pagination)
    // -------------------------------------------------------------
    getUserLists = async (req, res) => {
        try {
            let {
                city,
                state,
                phoneNumber,
                role,
                email,
                name,
                page = 1,
                pageSize = 10
            } = req.query;

            page = Number(page);
            pageSize = Number(pageSize);

            const skip = (page - 1) * pageSize;

            const matchCondition = { isActive: true };

            if (city) matchCondition["address.city"] = city.trim();
            if (state) matchCondition["address.state"] = state.trim();
            if (phoneNumber) matchCondition.phoneNumber = phoneNumber.trim();
            if (role) matchCondition.role = role.trim();
            if (email) matchCondition.email = email.trim();
            if (name) matchCondition.name = new RegExp(name, "i");

            const [users, totalCount] = await Promise.all([
                userService.userLists(matchCondition, skip, pageSize),
                userService.usersDocumentCount(matchCondition)
            ]);

            return RESPONSES.success(req, res, 200, "User list fetched!", {
                results: users,
                page,
                pageSize,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize)
            });

        } catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    // -------------------------------------------------------------
    // 6. Delete User (Soft Delete)
    // -------------------------------------------------------------
    deleteUser = async (req, res) => {
        try {
            const { userId } = req.params;

            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return RESPONSES.error(req, res, 400, "Invalid User ID");
            }

            const isDeleted = await userService.deleteUser(userId, { isActive: false });

            if (!isDeleted) {
                return RESPONSES.error(req, res, 400, "Failed to delete user!", { userId });
            }

            return RESPONSES.success(req, res, 200, "User deleted successfully!", isDeleted);

        } catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };
}

module.exports = new UserController();
