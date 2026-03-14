const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        dateOfBirth: {
            type: Date,
            required: true,
        },
        gender: {
            type: String,
            required: true,
            enum: ["male", "female", "others"]
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            required: true,
            default: "customer",
            enum: ["customer", "retailer"],
        },
        step1: { // General Information
            type: String,
            default: "completed",
        },
        step2: { // Address & store details
            type: String,
            default: "notcompleted",
            enum: ["pending", "notcompleted", "completed"]
        },
        step3: { // Location
            type: String,
            default: "notcompleted",
            enum: ["pending", "notcompleted", "completed"]
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
        phoneNumber: {
            type: String,
            required: true,
            unique: true
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
            default: true,
        }
    },
    {
        timestamps: true, // Adds createdAt & updatedAt
    }
);

// ✅ Index for geolocation queries
userSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("User", userSchema);
