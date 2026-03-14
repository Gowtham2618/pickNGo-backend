// models/Delivery.js
import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
    },
    deliveryPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: ["Assigned", "PickedUp", "OutForDelivery", "Delivered"],
        default: "Assigned",
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            default: [0, 0],
        },
    },
    deliveredAt: Date,
});

deliverySchema.index({ location: "2dsphere" });
export default mongoose.model("Delivery", deliverySchema);
