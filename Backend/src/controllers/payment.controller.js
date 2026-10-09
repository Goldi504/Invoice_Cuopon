const Payment = require("../models/Payment");
const Sale = require("../models/Sale");
const Inventory = require("../models/Inventory");
const mongoose = require("mongoose");

// ==========================================
// CREATE PAYMENT
// ==========================================
const createPayment = async (req, res) => {
  try {
    const {
      sale,
      customer,
      amount,
      paymentMethod,
      transactionId,
    } = req.body;

    if (!sale || !customer || amount === undefined || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message:
          "sale, customer, amount and paymentMethod are required",
      });
    }

    // Find sale
    const saleRecord = await Sale.findById(sale);

    if (!saleRecord) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    // Prevent duplicate payment
    const existingPayment = await Payment.findOne({
      sale,
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment already exists for this sale",
        payment: existingPayment,
      });
    }

    // Make sure amount matches sale amount
    if (Number(amount) !== Number(saleRecord.finalAmount)) {
      return res.status(400).json({
        success: false,
        message: `Payment amount must be ${saleRecord.finalAmount}`,
      });
    }

    const payment = await Payment.create({
      sale,
      customer,
      amount,
      paymentMethod,
      transactionId: transactionId || "",
      status: "PENDING",
    });

    return res.status(201).json({
      success: true,
      message: "Payment created successfully",
      payment,
    });
  } catch (error) {
    console.error("Create Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

// ==========================================
// COMPLETE PAYMENT
// ==========================================
// const completePayment = async (req, res) => {
//   const session = await mongoose.startSession();

//   try {
//     const { paymentId } = req.params;

//     let result;

//     await session.withTransaction(async () => {
//       const payment = await Payment.findById(
//         paymentId
//       ).session(session);

//       if (!payment) {
//         throw new Error("Payment not found");
//       }

//       if (payment.status === "PAID") {
//         throw new Error(
//           "Payment is already completed"
//         );
//       }

//       if (payment.status === "REFUNDED") {
//         throw new Error(
//           "Refunded payment cannot be completed"
//         );
//       }

//       const sale = await Sale.findById(
//         payment.sale
//       ).session(session);

//       if (!sale) {
//         throw new Error(
//           "Related sale not found"
//         );
//       }

//       const inventory =
//         await Inventory.findById(
//           sale.inventory
//         ).session(session);

//       if (!inventory) {
//         throw new Error(
//           "Related inventory item not found"
//         );
//       }

//       if (
//         inventory.status === "SOLD"
//       ) {
//         throw new Error(
//           "This inventory item is already sold"
//         );
//       }

//       // ==============================
//       // PAYMENT
//       // ==============================

//       payment.status = "PAID";
//       payment.paidAt = new Date();
//       payment.receivedBy = req.user._id;

//       await payment.save({
//         session,
//       });

//       // ==============================
//       // SALE
//       // ==============================

//       sale.paymentStatus = "PAID";
//       sale.saleStatus = "COMPLETED";
//       sale.completedAt = new Date();

//       await sale.save({
//         session,
//       });

//       // ==============================
//       // INVENTORY
//       // ==============================

//       inventory.status = "SOLD";
//       inventory.soldAt = new Date();

//       await inventory.save({
//         session,
//       });

//       result = {
//         paymentId: payment._id,
//         saleId: sale._id,
//         inventoryId: inventory._id,
//         imei: inventory.imei,
//       };
//     });

//     return res.status(200).json({
//       success: true,
//       message:
//         "Payment completed and sale finalized successfully",
//       result,
//     });

//   } catch (error) {

//     console.error(
//       "Complete Payment Error:",
//       error
//     );

//     return res.status(400).json({
//       success: false,
//       message: error.message,
//     });

//   } finally {
//     await session.endSession();
//   }
// };;

const completePayment = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { paymentId } = req.params;
    let result;

    await session.withTransaction(async () => {
      const payment = await Payment.findById(paymentId).session(session);

      if (!payment) throw new Error("Payment not found");
      if (payment.status === "PAID") {
        throw new Error("Payment is already completed");
      }
      if (payment.status !== "PENDING") {
        throw new Error("Only pending payments can be completed");
      }

      const sale = await Sale.findById(payment.sale).session(session);

      if (!sale) throw new Error("Related sale not found");

      if (sale.saleStatus !== "PENDING_PAYMENT") {
        throw new Error("Sale is not awaiting payment");
      }

      if (Number(payment.amount) !== Number(sale.finalAmount)) {
        throw new Error("Payment amount does not match the sale total");
      }

      // Support new multi-item sales and older single-item sales.
      const inventoryIds =
        sale.items?.length > 0
          ? sale.items.map((item) => item.inventory)
          : sale.inventory
            ? [sale.inventory]
            : [];

      if (inventoryIds.length === 0) {
        throw new Error("No inventory items are linked to this sale");
      }

      // Verify every phone is reserved before completing anything.
      for (const inventoryId of inventoryIds) {
        const inventory = await Inventory.findOne({
          _id: inventoryId,
          status: "RESERVED",
        }).session(session);

        if (!inventory) {
          throw new Error(
            "A phone is no longer reserved for this sale"
          );
        }
      }

      await Inventory.updateMany(
        {
          _id: { $in: inventoryIds },
          status: "RESERVED",
        },
        {
          $set: {
            status: "SOLD",
            soldAt: new Date(),
          },
        },
        { session }
      );

      payment.status = "PAID";
      payment.paidAt = new Date();
      payment.receivedBy = req.user._id;
      await payment.save({ session });

      sale.paymentStatus = "PAID";
      sale.saleStatus = "COMPLETED";
      sale.completedAt = new Date();
      await sale.save({ session });

      result = {
        paymentId: payment._id,
        saleId: sale._id,
        inventoryIds,
        invoiceNumber: sale.invoiceNumber,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Payment completed and sale finalized successfully",
      result,
    });
  } catch (error) {
    console.error("Complete Payment Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to complete payment",
    });
  } finally {
    await session.endSession();
  }
};


// ==========================================
// GET PAYMENT BY ID
// ==========================================
const getPaymentById = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId)
      .populate(
        "sale"
      )
      .populate(
        "customer",
        "name mobileNumber address"
      )
      .populate(
        "receivedBy",
        "name email role"
      );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Get Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get payment",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL PAYMENTS
// ==========================================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("sale")
      .populate(
        "customer",
        "name mobileNumber"
      )
      .populate(
        "receivedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    console.error("Get Payments Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get payments",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  completePayment,
  getPaymentById,
  getAllPayments,
};