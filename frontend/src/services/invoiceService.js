import api from "./api";

// Get all invoices
export const getInvoices = async () => {
  try {
    const response = await api.get("/invoices");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching invoices:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Get invoice details by ID
export const getInvoiceById = async (invoiceId) => {
  try {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    const response = await api.get(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching invoice details:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Create an invoice
export const createInvoice = async (invoiceData) => {
  try {
    if (!invoiceData) {
      throw new Error("Invoice data is required");
    }

    const response = await api.post("/invoices", invoiceData);
    return response.data;
  } catch (error) {
    console.error(
      "Error creating invoice:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Download invoice PDF
export const downloadInvoicePDF = async (invoiceId) => {
  try {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    const response = await api.get(`/invoices/${invoiceId}/pdf`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], {
      type: response.headers["content-type"] || "application/pdf",
    });

    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `invoice-${invoiceId}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(downloadUrl);

    return response.data;
  } catch (error) {
    console.error(
      "Error downloading invoice PDF:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Print invoice
export const printInvoice = () => {
  window.print();
};

// Default export
const invoiceService = {
  getInvoices,
  getInvoiceById,
  createInvoice,
  downloadInvoicePDF,
  printInvoice,
};

export default invoiceService;
