const Joi = require("joi");
const mongoose = require("mongoose");

const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

async function validateLogin(req, res, next) {
    try {
        const schema = Joi.object({
            email: Joi.string().required(),
            password: Joi.string().required(),
        });

        await schema.validateAsync(req.body)
            .then((response) => {
                next();
            }).catch((error) => {
                let message = error.details[0].message.replace(/"/g, "");
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, message)
            });
    } catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

async function validateOTPLogin(req, res, next) {
    try {
        const schema = Joi.object({
            phoneNumber: Joi.string().required(),
        });

        await schema.validateAsync(req.body)
            .then((response) => {
                next();
            }).catch((error) => {
                let message = error.details[0].message.replace(/"/g, "");
                return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, message)
            });
    } catch (error) {
        return RESPONSES.error(req, res, STATUS?.INTERNAL_SERVER_ERROR, `${error}`);
    }
};

async function validateVerifyOTP(req, res, next) {
    try {
        const schema = Joi.object({
            userId: Joi.string().custom((value, helpers) => {
                if (!mongoose.Types.ObjectId.isValid(value)) {
                    return helpers.error("any.invalid");
                }
                return value;
            }, "ObjectId validation").required(),
            otp: Joi.string().length(4).pattern(/^[0-9]{4}$/).required(),
        });

        await schema.validateAsync(req.body);
        next();

    } catch (error) {
        const message = error.details
            ? error.details[0].message.replace(/"/g, "")
            : error.message;

        return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, message);
    }
};


module.exports = { validateLogin, validateOTPLogin, validateVerifyOTP };
