const express = require("express");

const router = express.Router();

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");


// Both Admin and Employee can view products
router.get(
  "/",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getProducts
);


// Get single product
router.get(
  "/:id",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getProductById
);


// Only Admin can create products
router.post(
  "/",
  protect,
  authorize("ADMIN"),
  createProduct
);


// Only Admin can update products
router.put(
  "/:id",
  protect,
  authorize("ADMIN"),
  updateProduct
);


// Only Admin can delete products
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteProduct
);


module.exports = router;