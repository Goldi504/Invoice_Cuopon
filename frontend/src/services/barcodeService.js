import api from "./api";

export const scanProductBarcode = async (barcode) => {
  const response = await api.post("/products/scan", {
    barcode,
  });

  return response.data;
};