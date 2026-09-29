const mongoose = require("mongoose");

const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Inventory = require("../models/Inventory");
const Sale = require("../models/Sale");
const Payment = require("../models/Payment");


// Generate invoice number
const generateInvoiceNumber = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(100000 + Math.random() * 900000);

  return `GMS-${year}${month}${day}-${random}`;
};


// Create Sale
const createSale = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      customerId,
      customer,
      inventoryId,
      discount = 0,
      paymentMethod = "CASH",
    } = req.body;

    session.startTransaction();

    // -------------------------
    // 1. CUSTOMER
    // -------------------------

    let customerRecord;

    if (customerId) {
      customerRecord = await Customer.findById(
        customerId
      ).session(session);

      if (!customerRecord) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }
    } else {
      if (
        !customer ||
        !customer.name ||
        !customer.mobileNumber ||
        !customer.address
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Customer name, mobile number and address are required",
        });
      }

      customerRecord = await Customer.create(
        [
          {
            name: customer.name,
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

      customerRecord = customerRecord[0];
    }


    // -------------------------
    // 2. INVENTORY
    // -------------------------

    const inventory = await Inventory.findOneAndUpdate(
      {
        _id: inventoryId,
        status: "AVAILABLE",
      },
      {
        status: "RESERVED",
        reservedAt: new Date(),
      },
      {
        new: true,
        session,
      }
    ).populate("product");

    if (!inventory) {
      await session.abortTransaction();

      return res.status(409).json({
        success: false,
        message:
          "Mobile is not available. It may already be sold or reserved.",
      });
    }


    // -------------------------
    // 3. PRODUCT
    // -------------------------

    const product = inventory.product;

    if (!product || !product.isActive) {
      await session.abortTransaction();

      return res.status(404).json({
        success: false,
        message: "Product not found or inactive",
      });
    }


    // -------------------------
    // 4. CALCULATE PRICE
    // -------------------------

    const sellingPrice = product.sellingPrice;

    const numericDiscount = Number(discount);

    if (
      Number.isNaN(numericDiscount) ||
      numericDiscount < 0 ||
      numericDiscount > sellingPrice
    ) {
      await session.abortTransaction();

      return res.status(400).json({
        success: false,
        message: "Invalid discount amount",
      });
    }

    const finalAmount =
      sellingPrice - numericDiscount;


    // -------------------------
    // 5. CREATE SALE
    // -------------------------

    const invoiceNumber =
      generateInvoiceNumber();

    const sale = await Sale.create(
      [
        {
          invoiceNumber,

          customer: customerRecord._id,

          inventory: inventory._id,

          product: product._id,

          soldBy: req.user._id,

          productName:
            `${product.brand} ${product.model}`,

          imei: inventory.imei,

          quantity: 1,

          sellingPrice,

          discount: numericDiscount,

          finalAmount,

          warranty: product.warranty,

          guarantee: product.guarantee,

          saleStatus: "PENDING_PAYMENT",

          paymentStatus: "PENDING",

          paymentMethod:
            paymentMethod.toUpperCase(),
        },
      ],
      { session }
    );

    const saleRecord = sale[0];


    // -------------------------
    // 6. CREATE PAYMENT
    // -------------------------

    await Payment.create(
      [
        {
          sale: saleRecord._id,

          customer: customerRecord._id,

          amount: finalAmount,

          paymentMethod:
            paymentMethod.toUpperCase(),

          status: "PENDING",
        },
      ],
      { session }
    );


    await session.commitTransaction();

    return res.status(201).json({
      success: true,

      message:
        "Sale created successfully. Payment is pending.",

      sale: {
        id: saleRecord._id,

        invoiceNumber:
          saleRecord.invoiceNumber,

        customer:
          customerRecord.name,

        mobileNumber:
          customerRecord.mobileNumber,

        product:
          saleRecord.productName,

        imei:
          saleRecord.imei,

        amount:
          saleRecord.finalAmount,

        paymentStatus:
          saleRecord.paymentStatus,

        saleStatus:
          saleRecord.saleStatus,
      },
    });

  } catch (error) {

    await session.abortTransaction();

    console.error(
      "Create Sale Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create sale",
      error: error.message,
    });

  } finally {

    session.endSession();

  }
};


module.exports = {
  createSale,
};