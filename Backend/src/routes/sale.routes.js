
const express = require("express");
const { createSale } = require("../controllers/sale.controller");
const { protect } = require("../middlewares/auth.middleware");
const { authorize } = require("../middlewares/role.middleware");

const router = express.Router();

router.post(
  "/",
  protect,
  authorize("ADMIN", "EMPLOYEE"),
  createSale
);

module.exports = router;
