const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    brand: {
      type: String,
      required: [true, "Brand is required"],
      trim: true,
    },

    model: {
      type: String,
      required: [true, "Model name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["MOBILE", "ACCESSORY"],
      default: "MOBILE",
    },

    ram: {
      type: String,
      trim: true,
    },

    storage: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },

    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
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

    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
   {
    timestamps: true,
  }
);

productSchema.index({
  brand: 1,
  model: 1,
});

module.exports = mongoose.model("Product", productSchema);
