import api from "./api";

export const scanProductBarcode = async (
  barcode = "",
  ocrText = ""
) => {
  const response = await api.post(
    "/products/scan",
    {
      barcode,
      ocrText,
    }
  );

  return response.data;
};