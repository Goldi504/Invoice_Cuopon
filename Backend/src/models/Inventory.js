const mongoose = require("mongoose");

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    imei: {
      type: String,
      required: [true, "IMEI number is required"],
      unique: true,
      trim: true,
    },

    secondImei: {
      type: String,
      trim: true,
      default: "",
    },

    serialNumber: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "AVAILABLE",
        "RESERVED",
        "SOLD",
        "RETURNED",
        "DAMAGED",
      ],
      default: "AVAILABLE",
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reservedAt: {
      type: Date,
      default: null,
    },

    soldAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Inventory", inventorySchema);