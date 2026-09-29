const express = require("express");

const {
  getDashboardSummary,
  getTodaySales,
  getRecentSales,
  getStockSummary,
  getCustomerStatistics,
  getMonthlySales,
} = require("../controllers/dashboard.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

const router = express.Router();


// Main dashboard
router.get(
  "/summary",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getDashboardSummary
);


// Today's sales
router.get(
  "/today-sales",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getTodaySales
);


// Recent sales
router.get(
  "/recent-sales",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getRecentSales
);


// Stock
router.get(
  "/stock",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getStockSummary
);


// Customers
router.get(
  "/customers",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getCustomerStatistics
);


// Monthly sales
router.get(
  "/monthly-sales",
  protect,
  authorize("ADMIN"),
  getMonthlySales
);


module.exports = router;