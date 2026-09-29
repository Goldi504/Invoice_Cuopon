const Invoice = require("../models/Invoice");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = require("../utils/generateInvoicePDF");

const generateInvoiceNumber = require("../utils/generateInvoiceNumber");


// ==========================================
// CREATE INVOICE
// ==========================================

const createInvoice = async (req, res) => {
  try {
    const { saleId } = req.body;

    if (!saleId) {
      return res.status(400).json({
        success: false,
        message: "saleId is required",
      });
    }

    // Check sale
    const sale = await Sale.findById(saleId);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Check payment
    const payment = await Payment.findOne({
      saleId,
      paymentStatus: "PAID",
    });

    if (!payment) {
      return res.status(400).json({
        success: false,
        message:
          "Invoice cannot be generated before payment is completed",
      });
    }

    // Check existing invoice
    const existingInvoice = await Invoice.findOne({
      saleId,
    });

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice already exists for this sale",
        invoice: existingInvoice,
      });
    }

    // Find customer
    const customer = await Customer.findById(
      payment.customerId
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    /*
      IMPORTANT:

      The exact fields below depend on your existing
      Sale.js and Product.js models.

      We will adjust these fields according to your
      actual models if necessary.
    */

    const invoice = await Invoice.create({
      invoiceNumber: generateInvoiceNumber(),

      saleId: sale._id,

      customerId: customer._id,

      customerDetails: {
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address || "",
      },

      productDetails: {
        productId: sale.productId,
        productName: sale.productName || "",
        brand: sale.brand || "",
        model: sale.model || "",
        imei: sale.imei || "",
        secondImei: sale.secondImei || "",
        serialNumber: sale.serialNumber || "",
      },

      price: sale.price || payment.amount,

      discount: sale.discount || 0,

      gst: sale.gst || 0,

      totalAmount:
        sale.totalAmount || payment.amount,

      paymentMethod: payment.paymentMethod,

      paymentStatus: "PAID",

      paymentDate:
        payment.paidAt || new Date(),

      warranty: sale.warranty || "",

      guarantee: sale.guarantee || "",

      shopDetails: {
        shopName: "Golden Brand Mobile Shop",
        address: "YOUR SHOP ADDRESS",
        mobile: "YOUR SHOP MOBILE",
        email: "YOUR SHOP EMAIL",
      },

      createdBy: req.user._id,

      invoiceDate: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      invoice,
    });

  } catch (error) {

    console.error(
      "Create Invoice Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};


// ==========================================
// GET INVOICE
// ==========================================

const getInvoiceById = async (req, res) => {
  try {

    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(
      invoiceId
    )
      .populate(
        "customerId",
        "name mobile address"
      )
      .populate(
        "createdBy",
        "name email role"
      );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    return res.status(200).json({
      success: true,
      invoice,
    });

  } catch (error) {

    console.error(
      "Get Invoice Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get invoice",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL INVOICES
// ==========================================

const getAllInvoices = async (req, res) => {
  try {

    const invoices = await Invoice.find()
      .populate(
        "customerId",
        "name mobile"
      )
      .populate(
        "createdBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });

  } catch (error) {

    console.error(
      "Get All Invoices Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get invoices",
      error: error.message,
    });
  }
};
// ==========================================
// GENERATE INVOICE PDF
// ==========================================

const generateInvoicePDFController = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    // Create invoices directory
    const invoiceDirectory = path.join(
      __dirname,
      "../../uploads/invoices"
    );

    if (!fs.existsSync(invoiceDirectory)) {
      fs.mkdirSync(invoiceDirectory, {
        recursive: true,
      });
    }

    const fileName =
      `${invoice.invoiceNumber}.pdf`;

    const filePath = path.join(
      invoiceDirectory,
      fileName
    );

    await generateInvoicePDF(
      invoice,
      filePath
    );

    return res.status(200).json({
      success: true,
      message: "Invoice PDF generated successfully",

      invoiceId: invoice._id,

      invoiceNumber:
        invoice.invoiceNumber,

      fileName,

      fileUrl:
        `/uploads/invoices/${fileName}`,
    });
  } catch (error) {
    console.error(
      "Generate Invoice PDF Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to generate invoice PDF",
      error: error.message,
    });
  }
};


module.exports = {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  generateInvoicePDFController,
};