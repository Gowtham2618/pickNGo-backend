const Joi = require("joi");

const mongoose = require("mongoose");

const RESPONSES = require("../constants/response");
const MESSAGES = require("../constants/constantMessage");
const STATUS = require("../constants/statusCodes");

async function validateStoreOnboard(req, res, next) {
    try {
        const schemas = Joi.object({
            // isSameAsUserAddress: Joi.boolean().required(),
            userId: Joi.string().required(),
            storeName: Joi.string().min(3).max(50).required(),
            phoneNumber: Joi.string().required(),
            image1: Joi.string().optional(),
            image2: Joi.string().optional(),
        });

        // Validate step
        await schemas.validateAsync(req?.body);

        next();

    } catch (error) {
        const message = error.details
            ? error.details[0]?.message.replace(/"/g, "")
            : error.message;

        return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, message);
    }
};

async function validateStoreLists(req, res, next) {
    try {
        const schemas = Joi.object({
            page: Joi.number().required(),
            pageSize: Joi.number().required(),
            storeName: Joi.string().optional(),
            userId: Joi.string().optional()
        });

        // Validate step
        await schemas.validateAsync(req?.query);

        next();

    } catch (error) {
        const message = error.details
            ? error.details[0]?.message.replace(/"/g, "")
            : error.message;

        return RESPONSES.error(req, res, STATUS?.BAD_REQUEST, message);
    }
};

module.exports = { validateStoreOnboard, validateStoreLists };
