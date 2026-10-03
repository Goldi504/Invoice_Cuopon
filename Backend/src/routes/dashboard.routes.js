// const express = require("express");

// const {
//   getDashboardSummary,
//   getTodaySales,
//   getRecentSales,
//   getStockSummary,
//   getCustomerStatistics,
//   getMonthlySales,
// } = require("../controllers/dashboard.controller");

// const {
//   protect,
// } = require("../middlewares/auth.middleware");

// const {
//   authorize,
// } = require("../middlewares/role.middleware");

// const router = express.Router();


// // Main dashboard
// router.get(
//   "/summary",
//   protect,
//   authorize("ADMIN", "EMPLOYEE"),
//   getDashboardSummary
// );


// // Today's sales
// router.get(
//   "/today-sales",
//   protect,
//   authorize("ADMIN", "EMPLOYEE"),
//   getTodaySales
// );


// // Recent sales
// router.get(
//   "/recent-sales",
//   protect,
//   authorize("ADMIN", "EMPLOYEE"),
//   getRecentSales
// );


// // Stock
// router.get(
//   "/stock",
//   protect,
//   authorize("ADMIN", "EMPLOYEE"),
//   getStockSummary
// );


// // Customers
// router.get(
//   "/customers",
//   protect,
//   authorize("ADMIN", "EMPLOYEE"),
//   getCustomerStatistics
// );


// // Monthly sales
// router.get(
//   "/monthly-sales",
//   protect,
//   authorize("ADMIN"),
//   getMonthlySales
// );


// module.exports = router;

const express = require("express");

const {
  getDashboardSummary,
  getTodaySales,
  getRecentSales,
  getStockSummary,
  getCustomerStatistics,
  getMonthlySales,
  getLowStockProducts,
  getTopSellingProducts,
} = require("../controllers/dashboard.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

const router = express.Router();


// ==========================================
// MAIN DASHBOARD
// ==========================================

router.get(
  "/summary",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getDashboardSummary
);


// ==========================================
// TODAY'S SALES
// ==========================================

router.get(
  "/today-sales",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getTodaySales
);


// ==========================================
// RECENT SALES
// ==========================================

router.get(
  "/recent-sales",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getRecentSales
);


// ==========================================
// STOCK
// ==========================================

router.get(
  "/stock",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getStockSummary
);


// ==========================================
// CUSTOMERS
// ==========================================

router.get(
  "/customers",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getCustomerStatistics
);


// ==========================================
// MONTHLY SALES
// ==========================================

router.get(
  "/monthly-sales",
  protect,
  authorize("ADMIN"),
  getMonthlySales
);


// ==========================================
// LOW STOCK
// ==========================================

router.get(
  "/low-stock",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getLowStockProducts
);


// ==========================================
// TOP SELLING PRODUCTS
// ==========================================

router.get(
  "/top-products",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getTopSellingProducts
);


module.exports = router;