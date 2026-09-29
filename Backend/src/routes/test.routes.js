const express = require("express");

const router = express.Router();

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

const {
  getProfile,
  adminOnly,
  employeeOrAdmin,
} = require("../controllers/test.controller");


// Any logged-in user
router.get(
  "/profile",
  protect,
  getProfile
);


// Only ADMIN
router.get(
  "/admin",
  protect,
  authorize("ADMIN"),
  adminOnly
);


// ADMIN or EMPLOYEE
router.get(
  "/employee-access",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  employeeOrAdmin
);

module.exports = router;