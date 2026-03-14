const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSessionSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // ✅ should match the model name used in user.js
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    loginDetails: [
      {
        ipAddress: { type: String },
        device: { type: String },
        loginAt: { 
          type: Date, 
          default: Date.now },
      },
    ],
    phoneNumber: {
      type: String,
      required: true
    },
    otp: [
      {
        code: {
          type: Number
        },
        expiresAt: {
          type: Date,
          default: Date.now
        },
      },
    ],
    sessionKey: {
      type: String,
      required: false,
      default: null
    },
    refreshKey: {
      type: String,
      required: false,
      default: null
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

module.exports = mongoose.model("UserSession", userSessionSchema);
