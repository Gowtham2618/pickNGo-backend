const mongoose = require("mongoose");
const pug = require('pug');
const path = require('path');
const moment = require("moment");

const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

const authenticateService = require("../services/authentication.service");
const userService = require("../services/user.service");

const { hashUserPassword } = require("../middlewares/auth/hashedPassword");
const { mailTransporter } = require("../utils/mailSettings");
const { compareUserPassword } = require("../middlewares/auth/comparePassword");
const { generateResetToken, hashToken } = require("../utils/resetToken");


class Authenticate {

    userLogin = async (req, res) => {
        try {
            const { userDetails, accessToken, refreshToken, sessionObj } = req?.body ?? {};

            const updateObject = {
                sessionKey: accessToken,
                refreshKey: refreshToken,
            };
            let isUpdated = await authenticateService.updateUserSession(req, userDetails?._id, updateObject);
            if (!isUpdated) {
                RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, MESSAGES?.USER_SESSION_UPDATE_FAILED ?? "");
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_LOGGED_IN ?? "", sessionObj);
        }
        catch (error) {
            RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };

    userOTPLogin = async (req, res) => {
        try {
            const LOGIN_TYPE = "sms";
            let { userDetails, phoneNumber, otp } = req?.body;
            const updateObject = {
                code: otp,
                expiresAt: moment.utc().add(5, 'minutes').toDate(),
            };
            let isUpdated = await authenticateService.updateUserSession(userDetails?._id, updateObject, LOGIN_TYPE);
            if (!isUpdated) {
                RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, MESSAGES?.USER_SESSION_UPDATE_FAILED ?? "");
            }

            const response = {
                userId: userDetails?._id,
                phoneNumber: phoneNumber,
                otp: otp,
                email: userDetails?.email
            }
            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.OTP_GENERATED ?? "", response);

        }
        catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    updateSessionOnOTPVerification = async (req, res) => {
        try {
            const { userId, accessToken, refreshToken, sessionObj } = req?.body;
            const updateObject = {
                sessionKey: accessToken,
                refreshKey: refreshToken,
            };

            let isUpdated = await authenticateService.updateUserSession(req, userId, updateObject);
            if (!isUpdated) {
                RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, MESSAGES?.USER_SESSION_UPDATE_FAILED ?? "");
            }

            return RESPONSES.success(req, res, STATUS?.OK, MESSAGES?.USER_LOGGED_IN ?? "", sessionObj);
        }
        catch (error) {
            return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
        }
    };

    userPasswordReset = async (req, res) => {
        try {
            let { email, password, newPassword } = req?.body;

            const whereCondition = {
                email: email,
                isActive: true,
            };

            let userDetails = await userService.userDetails(whereCondition);
            if (!userDetails) {
                return RESPONSES.error(req, res, 409, "User not exists !", { email: email });
            }

            let isMatched = await compareUserPassword(password, userDetails.password);
            if (!isMatched) {
                return RESPONSES.error(req, res, 409, "Invalid credentials !");
            }

            const hashedPassword = await hashUserPassword(newPassword);
            let payload = {
                password: hashedPassword,
                isFtux: false,
            };

            let isPasswordUpdated = await userService.updateUser(userDetails._id, payload);

            if (!isPasswordUpdated) {
                return RESPONSES.error(req, res, 409, "Failed to reset user password !", { email: email });
            }

            let response = await this.generateTokenForUser(req, res, userDetails);

            return RESPONSES.success(req, res, 200, "User logged in success !", response);
        }
        catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    forgetPassword = async (req, res) => {
        try {
            let { email } = req?.body;

            const whereCondition = {
                email: email,
                isActive: true,
            };

            let userDetails = await authenticateService.userDetails(whereCondition);
            if (!userDetails) {
                return RESPONSES.error(req, res, 409, "User not exists !", { email: email });
            }
            const resetToken = generateResetToken();
            const hashedToken = hashToken(resetToken);


            const sendMail = await this.sendResetEmail(userDetails.email, hashedToken);
            return RESPONSES.success(req, res, 200, "Password reset instructions sent to your email.", email);

        }
        catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    sendResetEmail = async (email, resetToken) => {
        try {
            const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`; // Update with actual frontend URL

            const mailOptions = {
                from: 'gowthamsankar1026@gmail.com',
                to: email,
                subject: "Password Reset Request",
                html: `
                    <p>Hello,</p>
                    <p>You have requested a password reset. Click the link below to reset your password:</p>
                    <p><a href="${resetLink}" target="_blank">${resetLink}</a></p>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you did not request this, please ignore this email.</p>
                    <br>
                    <p>Best regards,</p>
                    <p>Your App Team</p>
                `,
            };
            let info = await mailTransporter.sendMail(mailOptions);
            console.log(`Password reset email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error("Error sending reset email:", error);
            throw new Error("Failed to send password reset email.");
        }
    };

};

module.exports = new Authenticate();