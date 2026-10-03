const axios = require("axios");

const lookupExternalBarcode = async (barcode) => {
  try {
    const response = await axios.get(
      `https://api.upcitemdb.com/prod/trial/lookup`,
      {
        params: {
          upc: barcode,
        },
        headers: {
          Accept: "application/json",
        },
        timeout: 10000,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "External Barcode API Error:",
      error.response?.data || error.message
    );

    return null;
  }
};

module.exports = {
  lookupExternalBarcode,
};