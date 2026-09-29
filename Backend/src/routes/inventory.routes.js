const express = require("express");

const router = express.Router();

const {
  addInventory,
  getInventory,
  getAvailableInventory,
  getInventoryById,
  updateInventory,
  getInventoryStats,
} = require("../controllers/inventory.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");


// All inventory routes require login
router.use(protect);


// Get inventory statistics
router.get(
  "/stats",
  authorize("ADMIN", "EMPLOYEE"),
  getInventoryStats
);


// Get available mobiles
router.get(
  "/available",
  authorize("ADMIN", "EMPLOYEE"),
  getAvailableInventory
);


// Get all inventory
router.get(
  "/",
  authorize("ADMIN", "EMPLOYEE"),
  getInventory
);


// Get single inventory item
router.get(
  "/:id",
  authorize("ADMIN", "EMPLOYEE"),
  getInventoryById
);


// Add mobile inventory - ADMIN ONLY
router.post(
  "/",
  authorize("ADMIN"),
  addInventory
);


// Update inventory
router.put(
  "/:id",
  authorize("ADMIN"),
  updateInventory
);


module.exports = router;