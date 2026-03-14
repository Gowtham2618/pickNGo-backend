const mongoose = require("mongoose");
const pug = require('pug');
const path = require('path');
const moment = require("moment");

const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

const authenticateService = require("../services/authentication.service");
const userService = require("../services/user.service");

const { generateAccessToken, generateRefreshToken } = require("../middlewares/auth/generateRefreshToken");
const { hashUserPassword } = require("../middlewares/auth/hashedPassword");
const { mailTransporter } = require("../utils/mailSettings");
const { compareUserPassword } = require("../middlewares/auth/comparePassword");
const { generateResetToken, hashToken } = require("../utils/resetToken");
const { genericCodeGeneration } = require("../utils/generateRandomCode");

const ENV = process.env;


class Authenticate {

    userLogin = async (req, res) => {
        try {
            const { userDetails,accessToken, refreshToken} = req?.body ?? {};
            userDetails = {
                ...userDetails,
                sessionKey: accessToken,
                refreshKey: refreshToken
            };

            let isExists = await authenticateService.isSessionExists(userDetails?._id);

            if (!isExists) {
                let sessionObj = {
                    userId: new mongoose.Types.ObjectId(userDetails?._id),
                    sessionKey: userToken,
                    refreshKey: refreshToken,
                    loginDetails: [{
                        loginAt: new Date()
                    }]
                }
                let isCreated = await authenticateService.createUserSession(sessionObj);

                if (!isCreated) {
                    return RESPONSES.error(req, res, 409, "Failed to create user session !");
                }
            }
            else {
                const updateObject = {
                    sessionKey: userToken,
                    refreshKey: refreshToken,
                };
                let isUpdated = await authenticateService.updateUserSession(userDetails?._id, updateObject, "email");
                if (!isUpdated) {
                    return RESPONSES.error(req, res, 409, "Failed to update user session !");
                }
            }

            return userDetails;
        }
        catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    userOTPLogin = async (req, res) => {
        try {
            let { phoneNumber } = req?.body;
            let { type } = req?.params;
            let matchCondition = {
                isActive: true,
                phoneNumber: String(phoneNumber)
            };

            let userDetails = await userService.userDetails(matchCondition);
            if (!userDetails) {
                return RESPONSES.error(req, res, 404, "User not exists, SignUp and try again !", { phoneNumber: phoneNumber });
            };

            let [isExists, isGeneratedOTP] = await Promise.all([
                authenticateService.isSessionExists(userDetails?._id),
                genericCodeGeneration("otp"),
            ]);

            if (!isGeneratedOTP) {
                return RESPONSES.error(req, res, 409, "Failed to generate OTP !");
            };

            if (!isExists) {
                let sessionObj = {
                    userId: new mongoose.Types.ObjectId(userDetails?._id),
                    phoneNumber: phoneNumber,
                    loginDetails: [{
                        loginAt: new Date()
                    }],
                    otp: [{
                        code: isGeneratedOTP,
                        expiresAt: moment().add(5, 'minutes').toDate()
                    }]
                };
                let isCreated = await authenticateService.createUserSession(sessionObj);

                if (!isCreated) {
                    return RESPONSES.error(req, res, 409, "Failed to create user session !");
                }
            }
            else {
                const updateObject = {
                    code: isGeneratedOTP
                };
                const isSessionUpdated = await authenticateService.updateUserSession(userDetails?._id, updateObject, type);
            }

            return RESPONSES.success(req, res, 200, "OTP generated Successfully !", { OTP: isGeneratedOTP });

        }
        catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
        }
    };

    verifyOTP = async (req, res) => {
        try {
            const { userId, otp } = req?.body;
            const sessionData = await authenticateService.isSessionExists(userId);
            if (!sessionData) {
                return RESPONSES.error(req, res, 404, "User session not exists !", {});
            }

            const { code } = sessionData?.otp?.at(-1);

            if (Number(code) !== Number(otp)) {
                return RESPONSES.error(req, res, 500, "Invalid OTP !", { OTP: otp });
            };

            const matchCondition = {
                isActive: true,
                _id: new mongoose.Types.ObjectId(userId),
            }

            let userDetails = await userService.userDetails(matchCondition);
            if (!userDetails) {
                return RESPONSES.error(req, res, 404, "User not exists !", {});
            }

            const isSessionUpdated = await this.generateTokenForUser(req, res, userDetails);
            return RESPONSES.success(req, res, 200, "User logged in success !", isSessionUpdated);
        }
        catch (error) {
            return RESPONSES.error(req, res, 500, `${error}`);
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

    // generateTokenForUser = async (req, res, userDetails) => {
    //     try {
    //         let [userToken, refreshToken] = await Promise.all([
    //             generateAccessToken(userDetails),
    //             generateRefreshToken(userDetails)
    //         ]);

    //         if (!userToken) {
    //             return RESPONSES.error(req, res, 409, "Failed to generate access token !");
    //         }

    //         userDetails = {
    //             ...userDetails,
    //             sessionKey: userToken,
    //             refreshKey: refreshToken
    //         };

    //         let isExists = await authenticateService.isSessionExists(userDetails?._id);

    //         if (!isExists) {
    //             let sessionObj = {
    //                 userId: new mongoose.Types.ObjectId(userDetails?._id),
    //                 sessionKey: userToken,
    //                 refreshKey: refreshToken,
    //                 loginDetails: [{
    //                     loginAt: new Date()
    //                 }]
    //             }
    //             let isCreated = await authenticateService.createUserSession(sessionObj);

    //             if (!isCreated) {
    //                 return RESPONSES.error(req, res, 409, "Failed to create user session !");
    //             }
    //         }
    //         else {
    //             const updateObject = {
    //                 sessionKey: userToken,
    //                 refreshKey: refreshToken,
    //             };
    //             let isUpdated = await authenticateService.updateUserSession(userDetails?._id, updateObject, "email");
    //             if (!isUpdated) {
    //                 return RESPONSES.error(req, res, 409, "Failed to update user session !");
    //             }
    //         }

    //         return userDetails;
    //     }
    //     catch (error) {
    //         return RESPONSES.error(req, res, 500, `${error}`);
    //     }
    // };

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