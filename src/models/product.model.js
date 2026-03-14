// models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        dealerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: String,
        category: {
            type: String,
            enum: ["Grocery", "Drinks", "Other"],
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            enum: ["ltr","kg","gram","ml"]
        },
        stock: {
            type: Number,
            default: 0,
        },
        image: String, // URL from Cloudinary
        rating: {   
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    }, {
    timestamps: true
}
);

export default mongoose.model("Product", productSchema);
