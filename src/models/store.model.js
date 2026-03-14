const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        storeName: {
            type: String,
            trim: true
        },
        phoneNumber: {
            type: String,
            unique: true
        },
        address: {
            doorNo: {
                type: Number
            },
            buildingName: {
                type: String,
                trim: true
            },
            street: {
                type: String,
                trim: true
            },
            city: {
                type: String,
                trim: true
            },
            pincode: {
                type: Number
            },
            state: {
                type: String,
                trim: true
            },
            country: {
                type: String,
                trim: true
            },
        },
        image1: {
            type: String,
            trim: true
        },
        image2: {
            type: String,
            trim: true
        },
        isSameAsUserAddress: {
            type: Boolean,
            default: false
        },
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point",
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                default: [0, 0],
            },
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

storeSchema.index({ location: "2dsphere" });
module.exports = mongoose.model("Store", storeSchema);
