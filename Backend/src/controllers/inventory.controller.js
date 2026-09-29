const Inventory = require("../models/Inventory");
const Product = require("../models/Product");


// Add a single mobile to inventory
const addInventory = async (req, res) => {
    try {
        const {
            productId,
            imei,
            secondImei,
            serialNumber,
        } = req.body;

        // Validation
        if (!productId || !imei) {
            return res.status(400).json({
                success: false,
                message: "Product ID and IMEI are required",
            });
        }

        // Check product exists
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }

        // Check duplicate IMEI
        const existingImei = await Inventory.findOne({ imei });

        if (existingImei) {
            return res.status(409).json({
                success: false,
                message: "This IMEI number already exists in inventory",
            });
        }

         // Create inventory item
    const inventory = await Inventory.create({
      product: productId,
      imei,
      secondImei: secondImei || "",
      serialNumber: serialNumber || "",
      addedBy: req.user._id,
    });
    return res.status(201).json({
      success: true,
      message: "Mobile added to inventory successfully",
      inventory,
    });
  } catch (error) {
    console.error("Add Inventory Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to add mobile to inventory",
      error: error.message,
    });
  }
};

// Get all inventory
const getInventory = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};

    if (status) {
      filter.status = status.toUpperCase();
    }

    const inventory = await Inventory.find(filter)
      .populate(
        "product",
        "brand model ram storage color sellingPrice"
      )
      .populate(
        "addedBy",
        "name email role"
      )
       .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
      error: error.message,
    });
  }
};

// Get available inventory
const getAvailableInventory = async (req, res) => {
  try {
    const inventory = await Inventory.find({
      status: "AVAILABLE",
    })
      .populate(
        "product",
        "brand model ram storage color sellingPrice warranty guarantee"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: inventory.length,
      inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch available inventory",
      error: error.message,
    });
  }
};

// Get inventory by ID
const getInventoryById = async (req, res) => {
  try {
    const inventory = await Inventory.findById(req.params.id)
      .populate("product")
      .populate("addedBy", "name email role");

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.status(200).json({
      success: true,
      inventory,
    });
  }
  catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory item",
      error: error.message,
    });
  }
};

// Update inventory details
const updateInventory = async (req, res) => {
  try {
    const { secondImei, serialNumber, status } = req.body;

    const inventory = await Inventory.findById(req.params.id);

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    // Do not allow manually changing SOLD mobile
    if (inventory.status === "SOLD") {
      return res.status(400).json({
        success: false,
        message:
          "Sold inventory cannot be modified manually",
      });
    }

    if (secondImei !== undefined) {
      inventory.secondImei = secondImei;
    }

    if (serialNumber !== undefined) {
      inventory.serialNumber = serialNumber;
    }
     // Only ADMIN can manually change status
    if (status && req.user.role === "ADMIN") {
      inventory.status = status.toUpperCase();
    }

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: "Inventory updated successfully",
      inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update inventory",
      error: error.message,
    });
  }
};

  // Inventory statistics
const getInventoryStats = async (req, res) => {
  try {
    const total = await Inventory.countDocuments();

    const available = await Inventory.countDocuments({
      status: "AVAILABLE",
    });

    const sold = await Inventory.countDocuments({
      status: "SOLD",
    });

    const damaged = await Inventory.countDocuments({
      status: "DAMAGED",
    });

    const returned = await Inventory.countDocuments({
      status: "RETURNED",
    });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        available,
        sold,
        damaged,
        returned,
      },
    });
  } 
  catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory statistics",
      error: error.message,
    });
  }
};

module.exports = {
  addInventory,
  getInventory,
  getAvailableInventory,
  getInventoryById,
  updateInventory,
  getInventoryStats,
};

