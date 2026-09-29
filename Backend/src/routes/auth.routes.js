const express = require("express");

const router = express.Router();

const {
  registerAdmin,
  loginUser,
  refreshAccessToken,
  logoutUser,
  createEmployee,
} = require("../controllers/auth.controller");

const { protect } = require("../middlewares/auth.middleware");

const { authorize } = require("../middlewares/role.middleware");


// Register Admin
router.post("/register-admin", registerAdmin);

// Login
router.post("/login", loginUser);

// Get new access token
router.post("/refresh-token", refreshAccessToken);

// Logout
router.post("/logout", logoutUser);

router.post("/create-employee",protect, authorize("ADMIN"),createEmployee
);


module.exports = router;