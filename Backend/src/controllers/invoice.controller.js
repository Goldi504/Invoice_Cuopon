
const mongoose = require("mongoose");
const Invoice = require("../models/Invoice");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = require("../utils/generateInvoicePDF");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");

const createInvoice = async (req, res) => {
  try {
    const { saleId } = req.body;

    if (!mongoose.isValidObjectId(saleId)) {
      return res.status(400).json({
        success: false,
        message: "A valid saleId is required",
      });
    }

    const sale = await Sale.findById(saleId)
      .populate("customer")
      .populate("items.product")
      .populate("product");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Return the existing invoice instead of creating a duplicate.
    const existingInvoice = await Invoice.findOne({
      saleId: sale._id,
    });

    if (existingInvoice) {
      return res.status(200).json({
        success: true,
        message: "Invoice already exists for this sale",
        invoice: existingInvoice,
      });
    }

    // Payment is linked to the sale by Payment.sale.
    const payment = await Payment.findOne({
      sale: sale._id,
      status: "PAID",
    });

    if (!payment) {
      return res.status(400).json({
        success: false,
        message: "Complete payment before generating the invoice",
      });
    }

    const customer =
      sale.customer ||
      (await Customer.findById(payment.customer));

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer linked to this sale was not found",
      });
    }

    const saleItems =
      Array.isArray(sale.items) && sale.items.length
        ? sale.items
        : [
            {
              product: sale.product,
              productName: sale.productName || "Mobile phone",
              imei: sale.imei || "",
              sellingPrice: sale.sellingPrice || sale.finalAmount,
            },
          ];

    const invoiceItems = saleItems.map((item) => ({
      productId: item.product?._id || item.product,
      productName:
        item.productName ||
        `${item.product?.brand || ""} ${item.product?.model || ""}`.trim() ||
        "Mobile phone",
      imei: item.imei || "",
      sellingPrice: Number(item.sellingPrice) || 0,
    }));

    const subtotal =
      Number(sale.subtotal) ||
      invoiceItems.reduce((sum, item) => sum + item.sellingPrice, 0);

    const discount = Number(sale.discount) || 0;
    const totalAmount = Number(sale.finalAmount);

    const firstProduct = saleItems[0]?.product;
    const firstItem = saleItems[0];

    const invoiceData = {
      invoiceNumber: sale.invoiceNumber || generateInvoiceNumber(),
      saleId: sale._id,
      customerId: customer._id,

      customerDetails: {
        name: customer.name,
        mobile: customer.mobileNumber,
        email: customer.email || "",
        address: customer.address || "",
      },

      items: invoiceItems,

      // Keep the legacy single-product field populated for
      // components that still read productDetails.
      productDetails: {
        productId: firstProduct?._id || firstProduct,
        productName:
          firstItem?.productName ||
          `${firstProduct?.brand || ""} ${firstProduct?.model || ""}`.trim() ||
          "Mobile phone",
        brand: firstProduct?.brand || "",
        model: firstProduct?.model || "",
        imei: firstItem?.imei || "",
        secondImei: "",
        serialNumber: "",
      },

      price: subtotal,
      discount,
      gst: 0,
      totalAmount,

      paymentMethod: payment.paymentMethod,
      paymentStatus: "PAID",
      paymentDate: payment.paidAt || new Date(),

      warranty: sale.warranty || firstProduct?.warranty || "No Warranty",
      guarantee:
        sale.guarantee || firstProduct?.guarantee || "No Guarantee",

      shopDetails: {
        shopName: "Golden Brand Mobile Shop",
        address: process.env.SHOP_ADDRESS || "Update shop address in environment",
        mobile: process.env.SHOP_MOBILE || "Update shop mobile in environment",
        email: process.env.SHOP_EMAIL || "",
      },

      createdBy: req.user._id,
      invoiceDate: new Date(),
    };

    let invoice;

    try {
      invoice = await Invoice.create(invoiceData);
    } catch (error) {
      // A simultaneous request may have created the invoice first.
      if (error.code === 11000) {
        invoice = await Invoice.findOne({ saleId: sale._id });
        if (invoice) {
          return res.status(200).json({
            success: true,
            message: "Invoice already exists for this sale",
            invoice,
          });
        }
      }
      throw error;
    }

    return res.status(201).json({
      success: true,
      message: "Invoice generated successfully",
      invoice,
    });
  } catch (error) {
    console.error("Create Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create invoice",
      error: error.message,
    });
  }
};

const getInvoiceById = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findById(invoiceId)
      .populate("customerId", "name mobileNumber email address")
      .populate("createdBy", "name email role");

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
    console.error("Get Invoice Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get invoice",
      error: error.message,
    });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("customerId", "name mobileNumber email")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: invoices.length,
      invoices,
    });
  } catch (error) {
    console.error("Get All Invoices Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get invoices",
      error: error.message,
    });
  }
};

const generateInvoicePDFController = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    if (!mongoose.isValidObjectId(invoiceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid invoice ID",
      });
    }

    const invoice = await Invoice.findById(invoiceId);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const invoiceDirectory = path.join(
      __dirname,
      "../../uploads/invoices"
    );

    await fs.promises.mkdir(invoiceDirectory, {
      recursive: true,
    });

    const fileName = `${invoice.invoiceNumber}.pdf`;
    const filePath = path.join(invoiceDirectory, fileName);

    await generateInvoicePDF(invoice, filePath);

    return res.status(200).json({
      success: true,
      message: "Invoice PDF generated successfully",
      invoiceId: invoice._id,
      invoiceNumber: invoice.invoiceNumber,
      fileName,
      fileUrl: `/uploads/invoices/${fileName}`,
    });
  } catch (error) {
    console.error("Generate Invoice PDF Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice PDF",
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
