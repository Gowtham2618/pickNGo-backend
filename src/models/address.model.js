const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
{
  userType: {
    type: String,
    enum: ["customer", "retailer"],
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "userType"
  },
  doorNo: {
    type: String,
    trim: true
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
  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point"
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0,0]
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
},
{
  timestamps: true
});

addressSchema.index({ location: "2dsphere" });
addressSchema.index({ ownerId: 1 });

module.exports = mongoose.model("Address", addressSchema);