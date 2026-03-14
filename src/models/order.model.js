import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // ✅ should match the actual user model name
            required: true,
        },
        retailerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    min: 1,
                },
                price: {
                    type: Number,
                    required: true,
                    min: 0,
                },
            },
        ],
        totalAmount: {
            type: Number,
            required: true,
            min: 0,
        },
        paymentMethod: {
            type: String,
            enum: ["COD", "Online"],
            default: "COD",
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Accepted",
                "Packed",
                "OutForDelivery",
                "Delivered",
                "Cancelled",
            ],
            default: "Pending",
        },
        deliveryAddress: {
            street: { 
                type: String, 
                required: true 
            },
            city: { 
                type: String, 
                required: true 
            },
            pincode: { 
                type: Number, 
                required: true 
            },
            state: { 
                type: String, 
                required: true 
            },
            country: { 
                type: String, 
                default: "India" 
            },
        },
        estimatedDeliveryDate: {
            type: Date,
        },
    },
    {
        timestamps: true, // ✅ adds createdAt & updatedAt automatically
    }
);

export default mongoose.model("Order", orderSchema);
