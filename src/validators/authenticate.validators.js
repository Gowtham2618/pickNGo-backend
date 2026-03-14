const Joi = require("joi");

const Responses = require("../constants/response");

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
                return Responses.error(req, res, 404, message)
            });
    } catch (error) {
        return Responses.error(req, res, 500, `${error}`);
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
                return Responses.error(req, res, 404, message)
            });
    } catch (error) {
        return Responses.error(req, res, 500, `${error}`);
    }
};

async function validateVerifyOTP(req, res, next) {
    try {
        const schema = Joi.object({
            otp: Joi.string().length(4).pattern(/^[0-9]{4}$/).required(),
        });

        await schema.validateAsync(req.body);
        next();

    } catch (error) {
        const message = error.details
            ? error.details[0].message.replace(/"/g, "")
            : error.message;

        return Responses.error(req, res, 400, message);
    }
};


module.exports = { validateLogin, validateOTPLogin, validateVerifyOTP };
