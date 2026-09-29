const generateReceiptMessage = ({
  invoice,
}) => {
  const customer =
    invoice.customerDetails;

  const product =
    invoice.productDetails;

  const shop =
    invoice.shopDetails;

  const date = new Date(
    invoice.invoiceDate
  ).toLocaleString("en-IN");

  return `
🏪 ${shop.shopName}

━━━━━━━━━━━━━━━━━━

🧾 DIGITAL RECEIPT

Invoice: ${invoice.invoiceNumber}
Date: ${date}

━━━━━━━━━━━━━━━━━━

👤 CUSTOMER

Name: ${customer.name}
Mobile: ${customer.mobile}
Address: ${customer.address || "N/A"}

━━━━━━━━━━━━━━━━━━

📱 PRODUCT

Product: ${product.productName}
Brand: ${product.brand || "N/A"}
Model: ${product.model || "N/A"}

IMEI: ${product.imei || "N/A"}
Serial No: ${product.serialNumber || "N/A"}

━━━━━━━━━━━━━━━━━━

💰 PAYMENT

Price: ₹${invoice.price}
Discount: ₹${invoice.discount}
GST: ₹${invoice.gst}

TOTAL: ₹${invoice.totalAmount}

Payment Method: ${invoice.paymentMethod}
Status: ${invoice.paymentStatus}

━━━━━━━━━━━━━━━━━━

🛡 WARRANTY

Warranty: ${invoice.warranty}
Guarantee: ${invoice.guarantee}

━━━━━━━━━━━━━━━━━━

🏪 ${shop.shopName}
${shop.address}
Mobile: ${shop.mobile}

Thank you for shopping with us! 🙏
`;
};

module.exports = {
  generateReceiptMessage,
};