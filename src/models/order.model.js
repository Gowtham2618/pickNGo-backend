const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Store",
            default: null
        },
        storeEmail: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
            default: null
        },
        storeName: {
            type: String,
            trim: true,
            default: null
        },
        storePhoneNumber: {
            type: String,
            trim: true,
            default: null
        },


        items: [
            {
                name: {
                    type: String
                },
                uom: {
                    type: String,
                    enum: ["kg", "gm", "ltr", "ml", "pcs"]
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1
                },

                price: {
                    type: Number,
                    required: true,
                    min: 0
                },

                isAvailable: {
                    type: Boolean,
                    default: true
                }
            }
        ],

        totalAmount: {
            type: Number,
            min: 0,
            default: 0
        },

        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD"
        },

        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Packing",
                "ReadyForPickup",
                "Completed",
                "Rejected"
            ],
            default: "Pending"
        },

        pickupCode: {
            type: Number,
            default: null
        },

        notes: {
            type: String,
            trim: true
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

// indexes for faster queries
orderSchema.index({ userId: 1 });
orderSchema.index({ storeId: 1 });
orderSchema.index({ status: 1 });

module.exports = mongoose.model("Order", orderSchema);