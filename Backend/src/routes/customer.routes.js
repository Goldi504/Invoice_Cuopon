const express = require("express");

const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  searchCustomer,
  updateCustomer,
  getCustomerHistory,
  deleteCustomer,
} = require("../controllers/customer.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

const router = express.Router();


// Create customer
router.post(
  "/",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  createCustomer
);


// Search customer
router.get(
  "/search",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  searchCustomer
);


// Get all customers
router.get(
  "/",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getAllCustomers
);


// Get customer
router.get(
  "/:id",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getCustomerById
);


// Customer history
router.get(
  "/:id/history",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getCustomerHistory
);


// Update customer
router.put(
  "/:id",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  updateCustomer
);


// Deactivate customer
router.delete(
  "/:id",
  protect,
  authorize("ADMIN"),
  deleteCustomer
);


module.exports = router;