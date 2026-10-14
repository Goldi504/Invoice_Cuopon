
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");

const generateInvoiceNumber = () => {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `GMS-${year}${month}${day}-${random}`;
};

const createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      inventoryIds,
      customerId,
      customer,
      discount = 0,
      paymentMethod = "CASH",
    } = req.body;

    const methods = ["CASH", "UPI", "CARD", "ONLINE", "COD"];

    if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Select at least one phone",
      });
    }

    if (
      inventoryIds.some((id) => !mongoose.isValidObjectId(id)) ||
      new Set(inventoryIds.map(String)).size !== inventoryIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Inventory IDs are invalid or duplicated",
      });
    }

    const method = String(paymentMethod).toUpperCase();

    if (!methods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    const numericDiscount = Number(discount);

    if (!Number.isFinite(numericDiscount) || numericDiscount < 0) {
      return res.status(400).json({
        success: false,
        message: "Discount must be a valid non-negative amount",
      });
    }

    let responseData;

    await session.withTransaction(async () => {
      // Find or create customer
      let customerRecord;

      if (customerId) {
        if (!mongoose.isValidObjectId(customerId)) {
          throw new Error("Invalid customer ID");
        }

        customerRecord = await Customer.findOne({
          _id: customerId,
          isActive: true,
        }).session(session);

        if (!customerRecord) {
          throw new Error("Customer not found");
        }
      } else {
        if (!customer?.name || !customer?.mobileNumber || !customer?.address) {
          throw new Error(
            "Customer name, mobile number and address are required"
          );
        }

        const existingCustomer = await Customer.findOne({
          mobileNumber: customer.mobileNumber,
        }).session(session);

        if (existingCustomer) {
          customerRecord = existingCustomer;
        } else {

          [customerRecord] = await Customer.create(
            [
              {
                name: customer.name,
                email: customer.email || "",
                mobileNumber: customer.mobileNumber,
                aadhaarNumber: customer.aadhaarNumber || "",
                address: customer.address,
                city: customer.city || "",
                state: customer.state || "",
                pincode: customer.pincode || "",
              },
            ],
            { session }
          );
          ;
        }
      }

      // Reserve each physical phone and get its current product price.
      const reservedItems = [];

      for (const inventoryId of inventoryIds) {
        const inventory = await Inventory.findOneAndUpdate(
          {
            _id: inventoryId,
            status: "AVAILABLE",
          },
          {
            $set: {
              status: "RESERVED",
              reservedAt: new Date(),
            },
          },
          {
            new: true,
            session,
          }
        ).populate("product");

        if (!inventory) {
          throw new Error(
            "A selected phone is unavailable. Refresh inventory and try again."
          );
        }

        if (!inventory.product || !inventory.product.isActive) {
          throw new Error("A selected product is inactive or missing");
        }

        reservedItems.push({
          inventory: inventory._id,
          product: inventory.product._id,
          productName:
            `${inventory.product.brand} ${inventory.product.model}`,
          imei: inventory.imei,
          sellingPrice: inventory.product.sellingPrice,
        });
      }

      const subtotal = reservedItems.reduce(
        (sum, item) => sum + item.sellingPrice,
        0
      );

      if (numericDiscount > subtotal) {
        throw new Error("Discount cannot exceed the subtotal");
      }

      const finalAmount = subtotal - numericDiscount;
      const invoiceNumber = generateInvoiceNumber();

      const firstInventory = await Inventory.findById(
        reservedItems[0].inventory
      )
        .populate("product")
        .session(session);

      const [sale] = await Sale.create(
        [{
          invoiceNumber,
          customer: customerRecord._id,
          soldBy: req.user._id,
          items: reservedItems,
          subtotal,
          discount: numericDiscount,
          finalAmount,
          // Keep legacy fields populated for older integrations.
          inventory: reservedItems[0].inventory,
          product: reservedItems[0].product,
          productName: reservedItems[0].productName,
          imei: reservedItems[0].imei,
          quantity: reservedItems.length,
          sellingPrice: reservedItems[0].sellingPrice,
          warranty: firstInventory?.product?.warranty || "No Warranty",
          guarantee: firstInventory?.product?.guarantee || "No Guarantee",
          saleStatus: "PENDING_PAYMENT",
          paymentStatus: "PENDING",
          paymentMethod: method,
        }],
        { session }
      );

      const [payment] = await Payment.create(
        [{
          sale: sale._id,
          customer: customerRecord._id,
          amount: finalAmount,
          paymentMethod: method,
          status: "PENDING",
        }],
        { session }
      );

      responseData = {
        saleId: sale._id,
        invoiceNumber,
        paymentId: payment._id,
        customer: {
          id: customerRecord._id,
          name: customerRecord.name,
          mobileNumber: customerRecord.mobileNumber,
        },
        items: reservedItems,
        subtotal,
        discount: numericDiscount,
        finalAmount,
        paymentMethod: method,
        paymentStatus: "PENDING",
      };
    });

    return res.status(201).json({
      success: true,
      message: "Sale created. Payment is pending.",
      sale: responseData,
    });
  } catch (error) {
    console.error("Create Sale Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create sale",
    });
  } finally {
    await session.endSession();
  }
};

module.exports = { createSale };
