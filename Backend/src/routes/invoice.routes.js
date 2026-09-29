const express = require("express");

const {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  generateInvoicePDFController,
} = require("../controllers/invoice.controller");

const {
  protect,
} = require("../middlewares/auth.middleware");

const {
  authorize,
} = require("../middlewares/role.middleware");

const router = express.Router();


// Create invoice
router.post(
  "/",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  createInvoice
);


// Get invoice
router.get(
  "/:invoiceId",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  getInvoiceById
);


// Get all invoices
router.get(
  "/",
  protect,
  authorize("ADMIN"),
  getAllInvoices
);
router.get(
  "/:invoiceId/pdf",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  generateInvoicePDFController
);


module.exports = router;