const Joi = require("joi");

const Responses = require("../constant/response");

async function validateUserStep1(req, res, next) {
    try {
        const schema = Joi.object({
            firstName: Joi.string().min(3).max(50).required(),
            lastName: Joi.string().min(3).max(50).required(),
            email: Joi.string().email().required(),
            dateOfBirth: Joi.date().required(),
            gender: Joi.string().valid("male", "female", "others").required(),
            role: Joi.string().valid("customer", "retailer").required(),
            phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).required(),
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

async function validateUserOnboardingStep(req, res, next) {
    try {
        const step = Number(req.params.step);
        const body = req.body;

        // Validation Schemas
        const schemas = {
            2: Joi.object({
                address: Joi.object({
                    doorNo: Joi.number().required(),
                    buildingName: Joi.string().required(),
                    street: Joi.string().required(),
                    city: Joi.string().required(),
                    pincode: Joi.number().required(),
                    state: Joi.string().required(),
                    country: Joi.string().required()
                }).required(),
            }),

            3: Joi.object({
                location: Joi.object({
                    type: Joi.string().valid("Point").required(),
                    coordinates: Joi.array()
                        .items(Joi.number())
                        .length(2)
                        .required(),
                }).required()
            }),
        };

        // Check valid step
        if (!schemas[step]) {
            return Responses.error(req, res, 400, "Invalid onboarding step");
        }

        // Validate step
        await schemas[step].validateAsync(body);

        next();

    } catch (error) {
        const message = error.details
            ? error.details[0]?.message.replace(/"/g, "")
            : error.message;

        return Responses.error(req, res, 400, message);
    }
};


async function validateUserUpdateForm(req, res, next) {
    try {
        const schema = Joi.object({
            name: Joi.string().min(3).max(50).optional(),
            email: Joi.string().email().optional(),
            role: Joi.string().valid("customer", "merchant", "admin").optional(),
            phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
            address: Joi.object({
                doorNo: Joi.string().optional(),
                buildingName: Joi.string().optional(),
                street: Joi.string().optional(),
                city: Joi.string().optional(),
                pincode: Joi.number().optional(),
                state: Joi.string().optional(),
                country: Joi.string().optional()
            }).optional(),
            location: Joi.object({
                type: Joi.string().valid("Point").optional(),
                coordinates: Joi.array()
                    .items(Joi.number())
                    .length(2) // [longitude, latitude]
                    .optional(),
            }).optional(),
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

async function validateUserlists(req, res, next) {
    try {
        const schema = Joi.object({
            page: Joi.number().required(),
            pageSize: Joi.number().required(),
            name: Joi.string().min(3).max(50).optional(),
            email: Joi.string().email().optional(),
            role: Joi.string().valid("customer", "merchant", "admin").optional(),
            phoneNumber: Joi.string().pattern(/^[0-9]{10}$/).optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional()
        });
        await schema.validateAsync(req?.query);
        next();

    } catch (error) {
        const message = error.details
            ? error.details[0].message.replace(/"/g, "")
            : error.message;
        return Responses.error(req, res, 400, message);
    }
};


module.exports = { validateUserStep1, validateUserOnboardingStep, validateUserUpdateForm, validateUserlists };
