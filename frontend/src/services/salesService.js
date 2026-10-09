
import api from "./api";

export const getAvailableInventory = async () => {
  const response = await api.get("/inventory/available");
  return response.data;
};

export const getCustomers = async () => {
  const response = await api.get("/customers");
  return response.data;
};

export const createSale = async (saleData) => {
  const response = await api.post("/sales", saleData);
  return response.data;
};

export const completePayment = async (paymentId) => {
  const response = await api.patch(
    `/payments/${paymentId}/complete`
  );
  return response.data;
};
