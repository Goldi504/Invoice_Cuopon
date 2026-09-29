const Invoice = require("../models/Invoice");

const {
  sendWhatsAppMessage,
} = require("../services/whatsapp.service");

const {
  generateReceiptMessage,
} = require("../services/receipt.service");


// ==========================================
// SEND INVOICE ON WHATSAPP
// ==========================================

const sendInvoiceWhatsApp = async (
  req,
  res
) => {
  try {
    const { invoiceId } =
      req.params;

    const invoice =
      await Invoice.findById(
        invoiceId
      );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    const customerMobile =
      invoice.customerDetails.mobile;

    if (!customerMobile) {
      return res.status(400).json({
        success: false,
        message:
          "Customer mobile number not available",
      });
    }

    const message =
      generateReceiptMessage({
        invoice,
      });

    await sendWhatsAppMessage({
      phoneNumber: customerMobile,
      message,
    });

    return res.status(200).json({
      success: true,
      message:
        "Receipt sent successfully on WhatsApp",
      invoiceNumber:
        invoice.invoiceNumber,
    });

  } catch (error) {

    console.error(
      "WhatsApp Receipt Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to send WhatsApp receipt",
      error: error.message,
    });
  }
};


module.exports = {
  sendInvoiceWhatsApp,
};