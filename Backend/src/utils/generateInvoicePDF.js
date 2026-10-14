
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const money = (value) =>
  `Rs. ${Number(value || 0).toFixed(2)}`;

const generateInvoicePDF = (invoice, filePath) =>
  new Promise((resolve, reject) => {
    let stream;

    try {
      fs.mkdirSync(path.dirname(filePath), {
        recursive: true,
      });

      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,
      });

      stream = fs.createWriteStream(filePath);

      stream.on("error", reject);
      doc.on("error", reject);
      stream.on("finish", () => resolve(filePath));

      doc.pipe(stream);

      const shop = invoice.shopDetails || {};
      const customer = invoice.customerDetails || {};

      const items =
        Array.isArray(invoice.items) && invoice.items.length
          ? invoice.items
          : [
              {
                productName:
                  invoice.productDetails?.productName || "Mobile phone",
                imei: invoice.productDetails?.imei || "",
                sellingPrice: invoice.price || invoice.totalAmount || 0,
              },
            ];

      // Shop header
      doc
        .font("Helvetica-Bold")
        .fontSize(20)
        .text(shop.shopName || "Golden Brand Mobile Shop", {
          align: "center",
        });

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(shop.address || "", { align: "center" });

      if (shop.mobile) {
        doc.text(`Mobile: ${shop.mobile}`, { align: "center" });
      }

      if (shop.email) {
        doc.text(`Email: ${shop.email}`, { align: "center" });
      }

      doc.moveDown();

      doc
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("DIGITAL RECEIPT", { align: "center" });

      doc.moveDown();

      // Invoice details
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text(`Invoice Number: ${invoice.invoiceNumber}`);
      doc.font("Helvetica").text(
        `Date: ${new Date(
          invoice.invoiceDate || invoice.createdAt || Date.now()
        ).toLocaleString("en-IN")}`
      );

      doc.moveDown();

      // Customer details
      doc.font("Helvetica-Bold").fontSize(12).text("CUSTOMER DETAILS");
      doc.moveDown(0.4);

      doc.font("Helvetica").fontSize(10);
      doc.text(`Name: ${customer.name || "N/A"}`);
      doc.text(`Mobile: ${customer.mobile || "N/A"}`);

      if (customer.email) {
        doc.text(`Email: ${customer.email}`);
      }

      doc.text(`Address: ${customer.address || "N/A"}`);
      doc.moveDown();

      // Products
      doc.font("Helvetica-Bold").fontSize(12).text("PRODUCT DETAILS");
      doc.moveDown(0.4);

      items.forEach((item, index) => {
        doc.font("Helvetica-Bold").fontSize(10).text(
          `${index + 1}. ${item.productName || "Mobile phone"}`
        );

        doc.font("Helvetica").fontSize(9);
        doc.text(`IMEI: ${item.imei || "N/A"}`);
        doc.text(`Price: ${money(item.sellingPrice)}`);
        doc.moveDown(0.4);
      });

      doc.moveDown(0.3);

      // Payment details
      doc.font("Helvetica-Bold").fontSize(12).text("PAYMENT DETAILS");
      doc.moveDown(0.4);

      doc.font("Helvetica").fontSize(10);
      doc.text(`Subtotal: ${money(invoice.price)}`);
      doc.text(`Discount: ${money(invoice.discount)}`);
      doc.text(`GST: ${money(invoice.gst)}`);

      doc.moveDown(0.3);

      doc.font("Helvetica-Bold").fontSize(14).text(
        `TOTAL AMOUNT: ${money(invoice.totalAmount)}`
      );

      doc.moveDown();

      doc.font("Helvetica").fontSize(10);
      doc.text(`Payment Method: ${invoice.paymentMethod || "N/A"}`);
      doc.text(`Payment Status: ${invoice.paymentStatus || "N/A"}`);

      if (invoice.paymentDate) {
        doc.text(
          `Payment Date: ${new Date(invoice.paymentDate).toLocaleString(
            "en-IN"
          )}`
        );
      }

      doc.moveDown();

      // Warranty and guarantee
      doc.font("Helvetica-Bold").fontSize(12).text("WARRANTY / GUARANTEE");
      doc.moveDown(0.4);

      doc.font("Helvetica").fontSize(10);
      doc.text(`Warranty: ${invoice.warranty || "N/A"}`);
      doc.text(`Guarantee: ${invoice.guarantee || "N/A"}`);

      doc.moveDown();

      // Terms
      doc.font("Helvetica-Bold").fontSize(11).text("TERMS & CONDITIONS");
      doc.moveDown(0.4);

      doc.font("Helvetica").fontSize(9).text(
        invoice.termsAndConditions || "No additional terms."
      );

      doc.moveDown(2);

      doc.font("Helvetica-Bold").fontSize(11).text(
        "Thank you for shopping with us!",
        { align: "center" }
      );

      doc.moveDown(0.5);

      doc.font("Helvetica").fontSize(9).text(
        shop.shopName || "Golden Brand Mobile Shop",
        { align: "center" }
      );

      // Add page numbers after all content has been written.
      const range = doc.bufferedPageRange();

      for (let i = range.start; i < range.start + range.count; i += 1) {
        doc.switchToPage(i);
        doc.font("Helvetica").fontSize(8).text(
          `Page ${i + 1} of ${range.count}`,
          45,
          doc.page.height - 30,
          {
            width: doc.page.width - 90,
            align: "center",
            lineBreak: false,
          }
        );
      }

      doc.end();
    } catch (error) {
      if (stream) stream.destroy();
      reject(error);
    }
  });

module.exports = generateInvoicePDF;
