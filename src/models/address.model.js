const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const addressSchema = new Schema(
{
  ownerType: {
    type: String,
    enum: ["User", "Store"],
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "ownerType"
  },
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