const Joi = require("joi");

const Responses = require("../constants/response");

async function validateStoreOnboard(req, res, next) {
    try {
        const schemas = Joi.object({
            // isSameAsUserAddress: Joi.boolean().required(),
            userId: Joi.string().required(),
            storeName: Joi.string().min(3).max(50).required(),
            phoneNumber: Joi.string().required(),
            image1: Joi.string().optional(),
            image2: Joi.string().optional(),
            address: Joi.object({
                doorNo: Joi.number().required(),
                buildingName: Joi.string().required(),
                street: Joi.string().required(),
                city: Joi.string().required(),
                pincode: Joi.number().required(),
                state: Joi.string().required(),
                country: Joi.string().required()
            }).required(),
            location: Joi.object({
                // type: Joi.string().valid("Point").required(),
                coordinates: Joi.array()
                    .items(Joi.number())
                    .length(2)
                    .required(),
            }).required()
        });

        // Validate step
        await schemas.validateAsync(req?.body);

        next();

    } catch (error) {
        const message = error.details
            ? error.details[0]?.message.replace(/"/g, "")
            : error.message;

        return Responses.error(req, res, 400, message);
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

        return Responses.error(req, res, 400, message);
    }
};

module.exports = { validateStoreOnboard, validateStoreLists };
