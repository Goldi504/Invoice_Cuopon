const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    inventory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productName: {
      type: String,
      required: true,
    },

    imei: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    finalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    warranty: {
      type: String,
      default: "No Warranty",
    },

    guarantee: {
      type: String,
      default: "No Guarantee",
    },

    saleStatus: {
      type: String,
      enum: [
        "PENDING_PAYMENT",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "PENDING_PAYMENT",
    },

    paymentStatus: {
      type: String,
      enum: [
        "PENDING",
        "PAID",
        "FAILED",
        "REFUNDED",
      ],
      default: "PENDING",
    },

    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "CARD",
        "ONLINE",
        "COD",
      ],
      default: "CASH",
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

saleSchema.index({
  customer: 1,
  createdAt: -1,
});

saleSchema.index({
  imei: 1,
});

module.exports = mongoose.model("Sale", saleSchema);