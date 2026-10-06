const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    /*
    ========================================================
    BARCODE
    ========================================================
    */

    barcode: {
      type: String,

      trim: true,

      unique: true,

      sparse: true,
    },

    /*
    ========================================================
    BASIC INFORMATION
    ========================================================
    */

    brand: {
      type: String,

      required: [
        true,
        "Brand is required",
      ],

      trim: true,
    },

    model: {
      type: String,

      required: [
        true,
        "Model name is required",
      ],

      trim: true,
    },

    category: {
      type: String,

      enum: [
        "MOBILE",
        "ACCESSORY",
      ],

      default: "MOBILE",
    },

    /*
    ========================================================
    SPECIFICATIONS
    ========================================================
    */

    ram: {
      type: String,

      trim: true,

      default: "",
    },

    storage: {
      type: String,

      trim: true,

      default: "",
    },

    color: {
      type: String,

      trim: true,

      default: "",
    },

    /*
    ========================================================
    PRICE
    ========================================================
    */

    purchasePrice: {
      type: Number,

      required: [
        true,
        "Purchase price is required",
      ],

      min: 0,
    },

    sellingPrice: {
      type: Number,

      required: [
        true,
        "Selling price is required",
      ],

      min: 0,
    },

    /*
    ========================================================
    WARRANTY
    ========================================================
    */

    warranty: {
      type: String,

      default: "No Warranty",

      trim: true,
    },

    guarantee: {
      type: String,

      default: "No Guarantee",

      trim: true,
    },

    /*
    ========================================================
    OTHER
    ========================================================
    */

    description: {
      type: String,

      trim: true,

      default: "",
    },

    image: {
      type: String,

      default: "",

      trim: true,
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

/*
============================================================
INDEX
============================================================
*/

productSchema.index({
  brand: 1,
  model: 1,
});

module.exports =
  mongoose.model(
    "Product",
    productSchema
  );