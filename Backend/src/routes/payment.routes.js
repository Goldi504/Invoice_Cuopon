const express = require("express");

const {
  createPayment,
  completePayment,
  getPaymentById,
  getAllPayments,
} = require("../controllers/payment.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

const router = express.Router();


// Create payment
router.post(
  "/",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  createPayment
);


// Complete payment
router.patch(
  "/:paymentId/complete",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  completePayment
);


// Get payment
router.get(
  "/:paymentId",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getPaymentById
);


// Get all payments
router.get(
  "/",
  protect,
  authorize("ADMIN"),
  getAllPayments
);


module.exports = router;