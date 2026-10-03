import api from "./api";


// ==========================================
// DASHBOARD SUMMARY
// ==========================================

export const getDashboardSummary = async () => {
  const response = await api.get(
    "/dashboard/summary"
  );

  return response.data;
};


// ==========================================
// TODAY'S SALES
// ==========================================

export const getTodaySales = async () => {
  const response = await api.get(
    "/dashboard/today-sales"
  );

  return response.data;
};


// ==========================================
// RECENT SALES
// ==========================================

export const getRecentSales = async (
  limit = 10
) => {
  const response = await api.get(
    `/dashboard/recent-sales?limit=${limit}`
  );

  return response.data;
};


// ==========================================
// STOCK SUMMARY
// ==========================================

export const getStockSummary = async () => {
  const response = await api.get(
    "/dashboard/stock"
  );

  return response.data;
};


// ==========================================
// CUSTOMER STATISTICS
// ==========================================

export const getCustomerStatistics =
  async () => {
    const response = await api.get(
      "/dashboard/customers"
    );

    return response.data;
  };


// ==========================================
// MONTHLY SALES
// ==========================================

export const getMonthlySales = async () => {
  const response = await api.get(
    "/dashboard/monthly-sales"
  );

  return response.data;
};


// ==========================================
// LOW STOCK PRODUCTS
// ==========================================

export const getLowStockProducts = async (
  threshold = 5
) => {
  const response = await api.get(
    `/dashboard/low-stock?threshold=${threshold}`
  );

  return response.data;
};


// ==========================================
// TOP SELLING PRODUCTS
// ==========================================

export const getTopSellingProducts = async (
  limit = 5
) => {
  const response = await api.get(
    `/dashboard/top-products?limit=${limit}`
  );

  return response.data;
};