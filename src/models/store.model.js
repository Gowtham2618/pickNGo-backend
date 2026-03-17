const { trim } = require("lodash");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storeSchema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        storeName: {
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
            unique: true,
            trim: true
        },

        images: [
            {
                type: String,
                trim: true
            }
        ],

        isSameAsUserAddress: {
            type: Boolean,
            default: false
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

// indexes
storeSchema.index({ ownerId: 1 });
storeSchema.index({ storeName: 1 });

module.exports = mongoose.model("Store", storeSchema);