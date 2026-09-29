const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
      unique: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Customer details snapshot
    customerDetails: {
      name: {
        type: String,
        required: true,
      },

      mobile: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        default: "",
      },
    },

    // Product details snapshot
    productDetails: {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },

      productName: {
        type: String,
        required: true,
      },

      brand: {
        type: String,
        default: "",
      },

      model: {
        type: String,
        default: "",
      },

      imei: {
        type: String,
        default: "",
      },

      secondImei: {
        type: String,
        default: "",
      },

      serialNumber: {
        type: String,
        default: "",
      },
    },

    // Money details
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gst: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Payment details
    paymentMethod: {
      type: String,
      enum: [
        "CASH",
        "UPI",
        "CARD",
        "BANK_TRANSFER",
      ],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING", "FAILED"],
      default: "PAID",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    // Warranty / Guarantee
    warranty: {
      type: String,
      default: "",
    },

    guarantee: {
      type: String,
      default: "",
    },

    // Shop details snapshot
    shopDetails: {
      shopName: {
        type: String,
        required: true,
      },

      address: {
        type: String,
        required: true,
      },

      mobile: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        default: "",
      },
    },

    termsAndConditions: {
      type: String,
      default:
        "Goods once sold will be subject to the shop warranty and applicable manufacturer terms.",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);