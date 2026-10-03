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
// ==========================================
// LOW STOCK PRODUCTS
// ==========================================

const getLowStockProducts = async (req, res) => {
  try {
    // Default low-stock limit = 5
    const threshold = Number(req.query.threshold || 5);

    const lowStockProducts = await Inventory.aggregate([
      // Only count available phones
      {
        $match: {
          status: "AVAILABLE",
        },
      },

      // Group inventory by product
      {
        $group: {
          _id: "$product",
          availableStock: {
            $sum: 1,
          },
        },
      },

      // Only products whose available stock
      // is less than or equal to threshold
      {
        $match: {
          availableStock: {
            $lte: threshold,
          },
        },
      },

      // Get product information
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      // Convert product array to object
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },

      // Return required fields
      {
        $project: {
          _id: 1,
          availableStock: 1,

          productName: {
            $ifNull: [
              "$product.name",
              {
                $concat: [
                  {
                    $ifNull: [
                      "$product.brand",
                      "",
                    ],
                  },
                  " ",
                  {
                    $ifNull: [
                      "$product.model",
                      "",
                    ],
                  },
                ],
              },
            ],
          },

          brand: "$product.brand",

          model: "$product.model",
        },
      },

      // Lowest stock first
      {
        $sort: {
          availableStock: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      threshold,
      count: lowStockProducts.length,
      products: lowStockProducts,
    });
  } catch (error) {
    console.error(
      "Low Stock Products Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load low stock products",
      error: error.message,
    });
  }
};


// ==========================================
// TOP SELLING PRODUCTS
// ==========================================

const getTopSellingProducts = async (req, res) => {
  try {
    const limit = Number(
      req.query.limit || 5
    );

    const topProducts = await Sale.aggregate([
      // Only completed and paid sales
      {
        $match: {
          saleStatus: "COMPLETED",
          paymentStatus: "PAID",
        },
      },

      // Group sales by product
      {
        $group: {
          _id: "$product",

          productName: {
            $first: "$productName",
          },

          totalSold: {
            $sum: "$quantity",
          },

          totalRevenue: {
            $sum: "$finalAmount",
          },
        },
      },

      // Highest selling product first
      {
        $sort: {
          totalSold: -1,
        },
      },

      // Only top products
      {
        $limit: limit,
      },

      // Get product details
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },

      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true,
        },
      },

      {
        $project: {
          _id: 1,

          productName: {
            $ifNull: [
              "$product.name",
              "$productName",
            ],
          },

          brand: "$product.brand",

          model: "$product.model",

          totalSold: 1,

          totalRevenue: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: topProducts.length,
      products: topProducts,
    });
  } catch (error) {
    console.error(
      "Top Selling Products Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load top selling products",
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
  getLowStockProducts,
  getTopSellingProducts,
};