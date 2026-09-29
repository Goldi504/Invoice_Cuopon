const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// ==========================================
// CREATE CUSTOMER
// ==========================================
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      mobileNumber,
      aadhaarNumber,
      address,
      city,
      state,
      pincode,
    } = req.body;

    if (!name || !mobileNumber || !address) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile number and address are required",
      });
    }

    const existingCustomer = await Customer.findOne({
      mobileNumber,
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer with this mobile number already exists",
        customer: existingCustomer,
      });
    }

    const customer = await Customer.create({
      name,
      mobileNumber,
      aadhaarNumber: aadhaarNumber || "",
      address,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
    });

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    console.error("Create Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create customer",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL CUSTOMERS
// ==========================================
const getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error("Get Customers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get customers",
      error: error.message,
    });
  }
};


// ==========================================
// GET CUSTOMER BY ID
// ==========================================
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      _id: id,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get customer",
      error: error.message,
    });
  }
};


// ==========================================
// SEARCH CUSTOMER
// ==========================================
const searchCustomer = async (req, res) => {
  try {
    const { mobile } = req.query;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number is required",
      });
    }

    const customer = await Customer.findOne({
      mobileNumber: mobile,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Search Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search customer",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE CUSTOMER
// ==========================================
const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "name",
      "mobileNumber",
      "aadhaarNumber",
      "address",
      "city",
      "state",
      "pincode",
    ];

    const updateData = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const customer = await Customer.findOneAndUpdate(
      {
        _id: id,
        isActive: true,
      },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer",
      error: error.message,
    });
  }
};


// ==========================================
// CUSTOMER PURCHASE HISTORY
// ==========================================
const getCustomerHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOne({
      _id: id,
      isActive: true,
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const sales = await Sale.find({
      customer: id,
    })
      .populate(
        "product",
        "brand model sellingPrice"
      )
      .populate(
        "inventory",
        "imei secondImei serialNumber status"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,

      customer: {
        id: customer._id,
        name: customer.name,
        mobileNumber: customer.mobileNumber,
        totalPurchases: customer.totalPurchases,
        totalSpent: customer.totalSpent,
      },

      count: sales.length,

      purchases: sales,
    });
  } catch (error) {
    console.error(
      "Customer History Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to get customer history",
      error: error.message,
    });
  }
};


// ==========================================
// DEACTIVATE CUSTOMER
// ==========================================
const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const customer = await Customer.findOneAndUpdate(
      {
        _id: id,
        isActive: true,
      },
      {
        isActive: false,
      },
      {
        new: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Customer deactivated successfully",
    });
  } catch (error) {
    console.error("Delete Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate customer",
      error: error.message,
    });
  }
};


module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  searchCustomer,
  updateCustomer,
  getCustomerHistory,
  deleteCustomer,
};