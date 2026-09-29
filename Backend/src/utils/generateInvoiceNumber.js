const generateInvoiceNumber = () => {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const randomNumber = Math.floor(
    100000 + Math.random() * 900000
  );

  return `GB-${year}${month}-${randomNumber}`;
};

module.exports = generateInvoiceNumber;