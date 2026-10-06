const express = require("express");

const router =
  express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  scanProductBarcode,
} = require("../controllers/product.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

/*
============================================================
SCAN
IMPORTANT: /scan BEFORE /:id
============================================================
*/

router.post(
  "/scan",
  protect,
  authorize("ADMIN"),
  scanProductBarcode
);

/*
============================================================
GET PRODUCTS
============================================================
*/

router.get(
  "/",
  protect,
  authorize(
    "ADMIN",
    "EMPLOYEE"
  ),
  getProducts
);

/*
============================================================
GET SINGLE PRODUCT
============================================================
*/

router.get(
  "/:id",
  protect,
  authorize(
    "ADMIN",
    "EMPLOYEE"
  ),
  getProductById
);

/*
============================================================
CREATE
============================================================
*/

router.post(
  "/",
  protect,
  authorize("ADMIN"),
  createProduct
);

/*
============================================================
UPDATE
============================================================
*/

router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  updateProduct
);

/*
============================================================
DELETE
============================================================
*/

router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteProduct
);

module.exports = router;