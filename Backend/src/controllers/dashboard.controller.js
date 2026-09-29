const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const Customer = require("../models/Customer");


// ==========================================
// DASHBOARD SUMMARY
// ==========================================

const getDashboardSummary = async (req, res) => {
  try {
    const totalCustomers =
      await Customer.countDocuments({
        isActive: true,
      });

    const availableStock =
      await Inventory.countDocuments({
        status: "AVAILABLE",
      });

    const soldStock =
      await Inventory.countDocuments({
        status: "SOLD",
      });

    const totalSales =
      await Sale.countDocuments({
        saleStatus: "COMPLETED",
      });

    const revenueResult =
      await Sale.aggregate([
        {
          $match: {
            saleStatus: "COMPLETED",
            paymentStatus: "PAID",
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: "$finalAmount",
            },
          },
        },
      ]);

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0;

    return res.status(200).json({
      success: true,

      summary: {
        totalCustomers,
        availableStock,
        soldStock,
        totalSales,
        totalRevenue,
      },
    });
  } catch (error) {
    console.error(
      "Dashboard Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load dashboard summary",
      error: error.message,
    });
  }
};


// ==========================================
// TODAY'S SALES
// ==========================================

const getTodaySales = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const sales = await Sale.find({
      saleStatus: "COMPLETED",

      paymentStatus: "PAID",

      createdAt: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate(
        "customer",
        "name mobileNumber"
      )
      .populate(
        "product",
        "brand model"
      )
      .sort({
        createdAt: -1,
      });

    const totalAmount = sales.reduce(
      (sum, sale) =>
        sum + sale.finalAmount,
      0
    );

    return res.status(200).json({
      success: true,

      count: sales.length,

      totalAmount,

      sales,
    });
  } catch (error) {
    console.error(
      "Today Sales Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load today's sales",
      error: error.message,
    });
  }
};


// ==========================================
// RECENT SALES
// ==========================================

const getRecentSales = async (req, res) => {
  try {
    const limit = Number(
      req.query.limit || 10
    );

    const sales = await Sale.find({
      saleStatus: "COMPLETED",
    })
      .populate(
        "customer",
        "name mobileNumber"
      )
      .populate(
        "product",
        "brand model"
      )
      .populate(
        "soldBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: sales.length,
      sales,
    });
  } catch (error) {
    console.error(
      "Recent Sales Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load recent sales",
      error: error.message,
    });
  }
};


// ==========================================
// STOCK SUMMARY
// ==========================================

const getStockSummary = async (req, res) => {
  try {
    const stock = await Inventory.aggregate([
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      stock,
    });
  } catch (error) {
    console.error(
      "Stock Summary Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load stock summary",
      error: error.message,
    });
  }
};


// ==========================================
// CUSTOMER STATISTICS
// ==========================================

const getCustomerStatistics = async (
  req,
  res
) => {
  try {
    const totalCustomers =
      await Customer.countDocuments({
        isActive: true,
      });

    const newCustomersToday =
      await Customer.countDocuments({
        isActive: true,

        createdAt: {
          $gte: (() => {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            return date;
          })(),
        },
      });

    return res.status(200).json({
      success: true,

      customers: {
        totalCustomers,
        newCustomersToday,
      },
    });
  } catch (error) {
    console.error(
      "Customer Statistics Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load customer statistics",
      error: error.message,
    });
  }
};


// ==========================================
// MONTHLY SALES
// ==========================================

const getMonthlySales = async (
  req,
  res
) => {
  try {
    const currentYear =
      new Date().getFullYear();

    const monthlySales =
      await Sale.aggregate([
        {
          $match: {
            saleStatus: "COMPLETED",

            paymentStatus: "PAID",

            createdAt: {
              $gte: new Date(
                `${currentYear}-01-01`
              ),

              $lt: new Date(
                `${currentYear + 1}-01-01`
              ),
            },
          },
        },

        {
          $group: {
            _id: {
              month: {
                $month: "$createdAt",
              },
            },

            totalSales: {
              $sum: 1,
            },

            revenue: {
              $sum: "$finalAmount",
            },
          },
        },

        {
          $sort: {
            "_id.month": 1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      year: currentYear,
      monthlySales,
    });
  } catch (error) {
    console.error(
      "Monthly Sales Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load monthly sales",
      error: error.message,
    });
  }
};


module.exports = {
  getDashboardSummary,
  getTodaySales,
  getRecentSales,
  getStockSummary,
  getCustomerStatistics,
  getMonthlySales,
};