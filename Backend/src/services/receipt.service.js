
const generateReceiptMessage = ({ invoice }) => {
  const customer = invoice.customerDetails || {};
  const shop = invoice.shopDetails || {};

  const date = new Date(
    invoice.invoiceDate || invoice.createdAt || Date.now()
  ).toLocaleString("en-IN");

  const items =
    Array.isArray(invoice.items) && invoice.items.length
      ? invoice.items
      : [
          {
            productName: invoice.productDetails?.productName || "Mobile phone",
            imei: invoice.productDetails?.imei || "",
            sellingPrice: invoice.price || invoice.totalAmount || 0,
          },
        ];

  const productLines = items
    .map(
      (item, index) =>
        `${index + 1}. ${item.productName || "Mobile phone"}\n` +
        `   IMEI: ${item.imei || "N/A"}\n` +
        `   Price: ₹${Number(item.sellingPrice || 0).toFixed(2)}`
    )
    .join("\n\n");

  return [
    `🏪 ${shop.shopName || "Golden Brand Mobile Shop"}`,
    "",
    "🧾 DIGITAL RECEIPT",
    `Invoice: ${invoice.invoiceNumber}`,
    `Date: ${date}`,
    "",
    "👤 CUSTOMER",
    `Name: ${customer.name || "N/A"}`,
    `Mobile: ${customer.mobile || "N/A"}`,
    `Email: ${customer.email || "N/A"}`,
    `Address: ${customer.address || "N/A"}`,
    "",
    "📱 PRODUCTS",
    productLines,
    "",
    "💰 PAYMENT",
    `Subtotal: ₹${Number(invoice.price || 0).toFixed(2)}`,
    `Discount: ₹${Number(invoice.discount || 0).toFixed(2)}`,
    `GST: ₹${Number(invoice.gst || 0).toFixed(2)}`,
    `TOTAL: ₹${Number(invoice.totalAmount || 0).toFixed(2)}`,
    `Method: ${invoice.paymentMethod || "N/A"}`,
    `Status: ${invoice.paymentStatus || "N/A"}`,
    "",
    "🛡 WARRANTY / GUARANTEE",
    `Warranty: ${invoice.warranty || "N/A"}`,
    `Guarantee: ${invoice.guarantee || "N/A"}`,
    "",
    shop.address || "",
    shop.mobile ? `Shop Mobile: ${shop.mobile}` : "",
    "",
    "Thank you for shopping with us! 🙏",
  ]
    .filter((line) => line !== undefined && line !== null)
    .join("\n");
};

module.exports = {
  generateReceiptMessage,
};
