const express = require("express");

const {
  sendInvoiceWhatsApp,
} = require("../controllers/whatsapp.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

const router =
  express.Router();

router.post(
  "/invoice/:invoiceId",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  sendInvoiceWhatsApp
);

module.exports = router;