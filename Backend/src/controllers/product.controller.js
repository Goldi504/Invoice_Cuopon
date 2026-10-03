const Product = require("../models/Product");
const {
  lookupExternalBarcode,
} = require("../services/barcode.service");
const {
  normalizeProductWithAI,
} = require("../services/productAI.service");

// Create Product
const createProduct = async (req, res) => {
  try {
    const {
      brand,
      model,
      category,
      ram,
      storage,
      color,
      purchasePrice,
      sellingPrice,
      warranty,
      guarantee,
      description,
      image,
    } = req.body;

    if (!brand || !model || purchasePrice === undefined || sellingPrice === undefined) {
      return res.status(400).json({
        success: false,
        message:
          "Brand, model, purchase price and selling price are required",
      });
    }

    const product = await Product.create({
      brand,
      model,
      category,
      ram,
      storage,
      color,
      purchasePrice,
      sellingPrice,
      warranty,
      guarantee,
      description,
      image,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};


// Get All Products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};


// Get Single Product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};


// Update Product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};


// Delete Product - Soft Delete
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

const scanProductBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;

    // =====================================
    // VALIDATE BARCODE
    // =====================================

    if (!barcode || !String(barcode).trim()) {
      return res.status(400).json({
        success: false,
        message: "Barcode is required",
      });
    }

    const cleanBarcode =
      String(barcode).trim();

    console.log(
      "Processing barcode:",
      cleanBarcode
    );

    // =====================================
    // 1. CHECK MONGODB
    // =====================================

    const existingProduct =
      await Product.findOne({
        barcode: cleanBarcode,
        isActive: true,
      });

    if (existingProduct) {
      console.log(
        "Product found in MongoDB"
      );

      return res.status(200).json({
        success: true,

        found: true,

        source: "database",

        message:
          "Product found in your database",

        product: existingProduct,
      });
    }

    // =====================================
    // 2. EXTERNAL BARCODE DATABASE
    // =====================================

    console.log(
      "Product not found locally."
    );

    console.log(
      "Searching external product database..."
    );

    const externalData =
      await lookupExternalBarcode(
        cleanBarcode
      );

    if (
      !externalData ||
      !externalData.items ||
      externalData.items.length === 0
    ) {
      console.log(
        "Product not found externally."
      );

      return res.status(200).json({
        success: true,

        found: false,

        source: null,

        barcode: cleanBarcode,

        message:
          "Product not found in external database",
      });
    }

    // =====================================
    // 3. GET EXTERNAL PRODUCT
    // =====================================

    const externalProduct =
      externalData.items[0];

    console.log(
      "External product found:",
      externalProduct.title
    );

    // =====================================
    // 4. SEND DATA TO GROQ
    // =====================================

    console.log(
      "Sending product information to Groq..."
    );

    const aiProduct =
      await normalizeProductWithAI(
        externalProduct,
        cleanBarcode
      );

    // =====================================
    // 5. BUILD FINAL PRODUCT
    // =====================================

    const finalProduct = {
      barcode: cleanBarcode,

      brand:
        aiProduct?.brand ||
        externalProduct.brand ||
        "",

      model:
        aiProduct?.model ||
        externalProduct.model ||
        "",

      category:
        aiProduct?.category ||
        "MOBILE",

      ram:
        aiProduct?.ram || "",

      storage:
        aiProduct?.storage || "",

      color:
        aiProduct?.color || "",

      // Shop-specific values remain empty
      purchasePrice: "",

      sellingPrice: "",

      warranty:
        "No Warranty",

      guarantee:
        "No Guarantee",

      description:
        aiProduct?.description ||
        externalProduct.description ||
        "",

      image:
        externalProduct.images?.[0] ||
        "",
    };

    // =====================================
    // 6. RETURN TO FRONTEND
    // =====================================

    return res.status(200).json({
      success: true,

      found: true,

      source: aiProduct
        ? "external+groq"
        : "external",

      message: aiProduct
        ? "Product found and processed with Groq AI"
        : "Product found from external database",

      product: finalProduct,
    });
  } catch (error) {
    console.error(
      "Scan Product Barcode Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to process barcode",

      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  scanProductBarcode,
};