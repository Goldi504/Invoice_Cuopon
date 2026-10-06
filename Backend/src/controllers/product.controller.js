const Product = require("../models/Product");

const {
  normalizeProductFromOCR,
} = require("../services/productAI.service");

/*
============================================================
CREATE PRODUCT
============================================================
*/

const createProduct = async (req, res) => {
  try {
    const {
      barcode,
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

    /*
    --------------------------------------------------------
    VALIDATION
    --------------------------------------------------------
    */

    if (
      !brand ||
      !brand.trim() ||
      !model ||
      !model.trim() ||
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Brand, model, purchase price and selling price are required.",
      });
    }

    /*
    --------------------------------------------------------
    CREATE PRODUCT
    --------------------------------------------------------
    */

    const product = await Product.create({
      barcode:
        barcode?.toString().trim() ||
        undefined,

      brand: brand.trim(),

      model: model.trim(),

      category:
        category || "MOBILE",

      ram:
        ram?.toString().trim() || "",

      storage:
        storage?.toString().trim() || "",

      color:
        color?.toString().trim() || "",

      purchasePrice:
        Number(purchasePrice),

      sellingPrice:
        Number(sellingPrice),

      warranty:
        warranty?.toString().trim() ||
        "No Warranty",

      guarantee:
        guarantee?.toString().trim() ||
        "No Guarantee",

      description:
        description?.toString().trim() ||
        "",

      image:
        image?.toString().trim() || "",
    });

    return res.status(201).json({
      success: true,

      message:
        "Product created successfully.",

      product,
    });
  } catch (error) {
    console.error(
      "Create Product Error:",
      error
    );

    /*
    Duplicate barcode
    */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,

        message:
          "A product with this barcode already exists.",

        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to create product.",

      error: error.message,
    });
  }
};

/*
============================================================
GET ALL PRODUCTS
============================================================
*/

const getProducts = async (req, res) => {
  try {
    const products =
      await Product.find({
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
    console.error(
      "Get Products Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch products.",

      error: error.message,
    });
  }
};

/*
============================================================
GET SINGLE PRODUCT
============================================================
*/

const getProductById = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,

        message:
          "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      product,
    });
  } catch (error) {
    console.error(
      "Get Product Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch product.",

      error: error.message,
    });
  }
};

/*
============================================================
UPDATE PRODUCT
============================================================
*/

const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findByIdAndUpdate(
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

        message:
          "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Product updated successfully.",

      product,
    });
  } catch (error) {
    console.error(
      "Update Product Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to update product.",

      error: error.message,
    });
  }
};

/*
============================================================
DELETE PRODUCT
============================================================
*/

const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findByIdAndUpdate(
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

        message:
          "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,

      message:
        "Product deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete product.",

      error: error.message,
    });
  }
};

/*
============================================================
SCAN PRODUCT
BARCODE + OCR + GROQ
============================================================
*/

const scanProductBarcode = async (
  req,
  res
) => {
  try {
    const {
      barcode,
      ocrText,
    } = req.body;

    /*
    --------------------------------------------------------
    CLEAN INPUT
    --------------------------------------------------------
    */

    const cleanBarcode =
      barcode
        ?.toString()
        .trim() || "";

    const cleanOCR =
      ocrText
        ?.toString()
        .trim() || "";

    console.log(
      "========================================"
    );

    console.log(
      "PRODUCT SCAN REQUEST"
    );

    console.log(
      "Barcode:",
      cleanBarcode || "Not detected"
    );

    console.log(
      "OCR:",
      cleanOCR || "Not detected"
    );

    console.log(
      "========================================"
    );

    /*
    --------------------------------------------------------
    VALIDATION
    --------------------------------------------------------
    */

    if (
      !cleanBarcode &&
      !cleanOCR
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Barcode or OCR text is required.",
      });
    }

    /*
    ========================================================
    STEP 1
    CHECK MONGODB USING BARCODE
    ========================================================
    */

    if (cleanBarcode) {
      const existingProduct =
        await Product.findOne({
          barcode: cleanBarcode,

          isActive: true,
        });

      if (existingProduct) {
        console.log(
          "Product found in MongoDB."
        );

        return res.status(200).json({
          success: true,

          found: true,

          source: "database",

          message:
            "Product found in your database.",

          product: existingProduct,
        });
      }
    }

    /*
    ========================================================
    STEP 2
    OCR + GROQ
    ========================================================
    */

    let aiProduct = null;

    if (cleanOCR) {
      console.log(
        "Sending OCR text to Groq..."
      );

      aiProduct =
        await normalizeProductFromOCR({
          barcode:
            cleanBarcode,

          ocrText:
            cleanOCR,
        });
    }

    /*
    ========================================================
    STEP 3
    GROQ SUCCESS
    ========================================================
    */

    if (aiProduct) {
      const finalProduct = {
        barcode:
          cleanBarcode,

        brand:
          aiProduct.brand || "",

        model:
          aiProduct.model || "",

        category:
          aiProduct.category ||
          "MOBILE",

        ram:
          aiProduct.ram || "",

        storage:
          aiProduct.storage || "",

        color:
          aiProduct.color || "",

        /*
        Price intentionally empty.
        User enters shop price.
        */

        purchasePrice: "",

        sellingPrice: "",

        warranty:
          "No Warranty",

        guarantee:
          "No Guarantee",

        description:
          aiProduct.description ||
          "",

        image: "",
      };

      console.log(
        "Final scanned product:",
        finalProduct
      );

      return res.status(200).json({
        success: true,

        found: true,

        source: "ocr+groq",

        message:
          "Product information detected successfully.",

        product:
          finalProduct,
      });
    }

    /*
    ========================================================
    STEP 4
    OCR/GROQ FAILED
    ========================================================
    */

    return res.status(200).json({
      success: true,

      found: false,

      source: null,

      barcode:
        cleanBarcode,

      message:
        "Product information could not be detected. Please enter the details manually.",
    });
  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "Scan Product Error:",
      error
    );

    console.error(
      "========================================"
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to process product scan.",

      error:
        error.message,
    });
  }
};

/*
============================================================
EXPORT
============================================================
*/

module.exports = {
  createProduct,

  getProducts,

  getProductById,

  updateProduct,

  deleteProduct,

  scanProductBarcode,
};