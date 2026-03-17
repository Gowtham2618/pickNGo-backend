const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phoneNumber: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        },

        dateOfBirth: {
            type: Date
        },

        gender: {
            type: String,
            enum: ["male", "female", "others"]
        },

        role: {
            type: String,
            enum: ["customer", "retailer"],
            default: "customer"
        },

        onboarding: {
            step1: { // personal details
                type: String,
                default: "completed"
            },
            step2: { // address details
                type: String,
                enum: ["pending", "notcomplete", "completed"],
                default: "notcomplete"
            },
            step3: { // location details
                type: String,
                enum: ["pending", "notcomplete", "completed"],
                default: "notcomplete"
            }
        },

        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps: true
    }
);

// NOTE: `unique: true` on the schema fields already creates indexes.
//       Avoid creating duplicate indexes by not re-declaring them here.
module.exports = mongoose.model("User", userSchema);