import api from "./api";

// ========================================
// GET ALL INVENTORY
// ========================================
export const getInventory = async () => {
  const response = await api.get("/inventory");
  return response.data;
};

// ========================================
// GET INVENTORY BY PRODUCT
// ========================================
export const getInventoryByProduct = async (productId) => {
  const response = await api.get(
    `/inventory/product/${productId}`
  );

  return response.data;
};

// ========================================
// CREATE INVENTORY
// ========================================
export const createInventory = async (data) => {
  const response = await api.post(
    "/inventory",
    data
  );

  return response.data;
};

// ========================================
// ADD STOCK
// ========================================
export const addStock = async (
  productId,
  quantity
) => {
  const response = await api.patch(
    `/inventory/product/${productId}/add`,
    {
      quantity,
    }
  );

  return response.data;
};

// ========================================
// REMOVE STOCK
// ========================================
export const removeStock = async (
  productId,
  quantity
) => {
  const response = await api.patch(
    `/inventory/product/${productId}/remove`,
    {
      quantity,
    }
  );

  return response.data;
};

// ========================================
// UPDATE LOW STOCK LIMIT
// ========================================
export const updateLowStockLimit = async (
  productId,
  lowStockLimit
) => {
  const response = await api.patch(
    `/inventory/product/${productId}/limit`,
    {
      lowStockLimit,
    }
  );

  return response.data;
};

// ========================================
// DELETE INVENTORY
// ========================================
export const deleteInventory = async (
  productId
) => {
  const response = await api.delete(
    `/inventory/product/${productId}`
  );

  return response.data;
};