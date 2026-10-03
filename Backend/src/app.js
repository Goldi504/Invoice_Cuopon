const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const authRoutes = require("./routes/auth.routes");
const testRoutes = require("./routes/test.routes");
const productRoutes = require("./routes/product.routes");
const inventoryRoutes = require("./routes/inventory.routes");
const paymentRoutes = require("./routes/payment.routes");
const invoiceRoutes = require("./routes/invoice.routes");
const customerRoutes = require("./routes/customer.routes");
const whatsappRoutes = require("./routes/whatsapp.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const path = require("path");
const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ganesh Mobile Backend API is running 🚀",
  });
});
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/customers", customerRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/dashboard", dashboardRoutes);

module.exports = app;