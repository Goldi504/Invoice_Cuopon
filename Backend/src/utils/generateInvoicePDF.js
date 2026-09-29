const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateInvoicePDF = (invoice, filePath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // ==========================================
      // SHOP HEADER
      // ==========================================

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .text(invoice.shopDetails.shopName, {
          align: "center",
        });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(invoice.shopDetails.address, {
          align: "center",
        });

      doc.text(
        `Mobile: ${invoice.shopDetails.mobile}`,
        {
          align: "center",
        }
      );

      if (invoice.shopDetails.email) {
        doc.text(
          `Email: ${invoice.shopDetails.email}`,
          {
            align: "center",
          }
        );
      }

      doc.moveDown();

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("DIGITAL RECEIPT", {
          align: "center",
        });

      doc.moveDown();

      // ==========================================
      // INVOICE INFORMATION
      // ==========================================

      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text(
          `Invoice Number: ${invoice.invoiceNumber}`
        );

      doc
        .font("Helvetica")
        .text(
          `Date: ${new Date(
            invoice.invoiceDate
          ).toLocaleString("en-IN")}`
        );

      doc.moveDown();

      // ==========================================
      // CUSTOMER
      // ==========================================

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("CUSTOMER DETAILS");

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Name: ${invoice.customerDetails.name}`
        );

      doc.text(
        `Mobile: ${invoice.customerDetails.mobile}`
      );

      doc.text(
        `Address: ${
          invoice.customerDetails.address || "N/A"
        }`
      );

      doc.moveDown();

      // ==========================================
      // PRODUCT
      // ==========================================

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("PRODUCT DETAILS");

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Product: ${invoice.productDetails.productName}`
        );

      doc.text(
        `Brand: ${
          invoice.productDetails.brand || "N/A"
        }`
      );

      doc.text(
        `Model: ${
          invoice.productDetails.model || "N/A"
        }`
      );

      doc.text(
        `IMEI: ${
          invoice.productDetails.imei || "N/A"
        }`
      );

      doc.text(
        `Second IMEI: ${
          invoice.productDetails.secondImei || "N/A"
        }`
      );

      doc.text(
        `Serial Number: ${
          invoice.productDetails.serialNumber ||
          "N/A"
        }`
      );

      doc.moveDown();

      // ==========================================
      // PRICE DETAILS
      // ==========================================

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("PAYMENT DETAILS");

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Product Price: ₹${invoice.price.toFixed(2)}`
        );

      doc.text(
        `Discount: ₹${invoice.discount.toFixed(2)}`
      );

      doc.text(
        `GST: ₹${invoice.gst.toFixed(2)}`
      );

      doc.moveDown(0.5);

      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(
          `TOTAL AMOUNT: ₹${invoice.totalAmount.toFixed(
            2
          )}`
        );

      doc.moveDown();

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Payment Method: ${invoice.paymentMethod}`
        );

      doc.text(
        `Payment Status: ${invoice.paymentStatus}`
      );

      if (invoice.paymentDate) {
        doc.text(
          `Payment Date: ${new Date(
            invoice.paymentDate
          ).toLocaleString("en-IN")}`
        );
      }

      doc.moveDown();

      // ==========================================
      // WARRANTY
      // ==========================================

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text("WARRANTY / GUARANTEE");

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Warranty: ${invoice.warranty || "N/A"}`
        );

      doc.text(
        `Guarantee: ${
          invoice.guarantee || "N/A"
        }`
      );

      doc.moveDown();

      // ==========================================
      // TERMS
      // ==========================================

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("TERMS & CONDITIONS");

      doc.moveDown(0.5);

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          invoice.termsAndConditions ||
            "No additional terms."
        );

      doc.moveDown(2);

      // ==========================================
      // FOOTER
      // ==========================================

      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text(
          "Thank you for shopping with us!",
          {
            align: "center",
          }
        );

      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          invoice.shopDetails.shopName,
          {
            align: "center",
          }
        );

      doc.end();

      stream.on("finish", () => {
        resolve(filePath);
      });

      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateInvoicePDF;