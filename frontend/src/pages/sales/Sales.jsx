import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Smartphone,
  RefreshCw,
  UserRound,
  CreditCard,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Package,
  Receipt,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";

import {
  getAvailableInventory,
  getCustomers,
  createSale,
  completePayment,
} from "../../services/salesService";

import api from "../../services/api";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const getProductName = (product) =>
  `${product?.brand || ""} ${product?.model || ""}`.trim() ||
  "Unknown Product";

const pageVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.06,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
    },
  },
};

const buttonTransition = {
  type: "spring",
  stiffness: 350,
  damping: 22,
};

// Dashboard-matching colors
const PAGE_BG = "#F4F0E6";
const CARD_BG = "#FFFEFA";
const BORDER_COLOR = "#E6D9BD";
const TEXT_COLOR = "#171914";
const MUTED_COLOR = "#746D5E";
const GOLD_COLOR = "#E9B83F";

// --------------------------------------------------
// Animated Button
// --------------------------------------------------

function AnimatedButton({
  children,
  onClick,
  disabled = false,
  variant = "dark",
  type = "button",
  className = "",
}) {
  const styles = {
    dark:
      "bg-gradient-to-r from-[#FFE18A] to-[#E9B83F] text-[#171914] hover:from-[#F8D46A] hover:to-[#DDAA2D]",
    gold: "bg-[#F4C64E] text-[#171914] hover:bg-[#E7B83B]",
    outline:
      "border border-[#E6D9BD] bg-[#FFFEFA] text-[#514B3E] hover:border-[#D4AF37] hover:bg-[#FFF5D6]",
    danger: "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={buttonTransition}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

// --------------------------------------------------
// Animated Stat Card
// --------------------------------------------------

function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{
        y: -3,
        scale: 1.005,
        boxShadow: "0 10px 24px rgba(120, 91, 26, 0.08)",
      }}
      transition={buttonTransition}
      className="rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-sm transition-colors sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-[#746D5E]">{title}</p>

          <motion.p
            key={String(value)}
            initial={{ opacity: 0.6, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 break-words text-2xl font-extrabold tracking-tight text-[#171914]"
          >
            {value}
          </motion.p>

          <p className="mt-2 text-xs text-[#918875]">{subtitle}</p>
        </div>

        <motion.div
          whileHover={{ scale: 1.06 }}
          transition={buttonTransition}
          className="shrink-0 rounded-xl bg-[#FFF5D6] p-3 text-[#8A650D]"
        >
          <Icon size={22} />
        </motion.div>
      </div>
    </motion.div>
  );
}
const formatNumber = (value) => {
  const number = Number(value ?? 0);

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// --------------------------------------------------
// Sales Page
// --------------------------------------------------

export default function Sales() {
  const [inventory, setInventory] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const [discount, setDiscount] = useState("0");
  const [customerId, setCustomerId] = useState("");
  const [newCustomer, setNewCustomer] = useState(false);

  const [customerForm, setCustomerForm] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    address: "",
    aadhaarNumber: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("CASH");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lastSale, setLastSale] = useState(null);

  // ------------------------------------------------
  // Load data
  // ------------------------------------------------

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [inventoryResponse, customerResponse] = await Promise.all([
        getAvailableInventory(),
        getCustomers(),
      ]);

      setInventory(inventoryResponse.inventory || []);
      setCustomers(customerResponse.customers || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load products and customers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ------------------------------------------------
  // Group inventory by product
  // ------------------------------------------------

  const products = useMemo(() => {
    const groups = new Map();

    inventory.forEach((item) => {
      if (!item.product || item.status !== "AVAILABLE") return;

      const productId = item.product._id;

      if (!groups.has(productId)) {
        groups.set(productId, {
          product: item.product,
          inventoryItems: [],
        });
      }

      groups.get(productId).inventoryItems.push(item);
    });

    return Array.from(groups.values()).filter(
      ({ product, inventoryItems }) => {
        const query = search.trim().toLowerCase();

        const searchable = [
          product.brand,
          product.model,
          product.ram,
          product.storage,
          product.color,
          ...inventoryItems.map((item) => item.imei),
          ...inventoryItems.map((item) => item.serialNumber),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return !query || searchable.includes(query);
      }
    );
  }, [inventory, search]);

  // ------------------------------------------------
  // Price calculations
  // ------------------------------------------------

  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.inventoryIds.length,
    0
  );

  const discountAmount = Math.max(0, Number(discount) || 0);
  const total = Math.max(0, subtotal - discountAmount);

  const totalQuantity = cart.reduce(
    (count, item) => count + item.inventoryIds.length,
    0
  );

  // ------------------------------------------------
  // Add product
  // ------------------------------------------------

  const addProduct = (group) => {
    const alreadySelected = new Set(
      cart.flatMap((item) => item.inventoryIds)
    );

    const availablePhone = group.inventoryItems.find(
      (item) => !alreadySelected.has(item._id)
    );

    if (!availablePhone) {
      setError("No more available phones of this model.");
      return;
    }

    setError("");
    setSuccess("");

    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === group.product._id
      );

      if (existing) {
        return current.map((item) =>
          item.productId === group.product._id
            ? {
                ...item,
                inventoryIds: [
                  ...item.inventoryIds,
                  availablePhone._id,
                ],
              }
            : item
        );
      }

      return [
        ...current,
        {
          productId: group.product._id,
          name: getProductName(group.product),
          brand: group.product.brand,
          model: group.product.model,
          price: Number(group.product.sellingPrice) || 0,
          image: group.product.image,
          inventoryIds: [availablePhone._id],
        },
      ];
    });
  };

  // ------------------------------------------------
  // Change quantity
  // ------------------------------------------------

  const changeQuantity = (productId, direction) => {
    const currentItem = cart.find(
      (item) => item.productId === productId
    );

    if (!currentItem) return;

    if (direction > 0) {
      const group = products.find(
        (item) => item.product._id === productId
      );

      if (!group) {
        setError("Refresh inventory before adding another phone.");
        return;
      }

      addProduct(group);
      return;
    }

    setCart((current) =>
      current
        .map((item) =>
          item.productId === productId
            ? {
                ...item,
                inventoryIds: item.inventoryIds.slice(0, -1),
              }
            : item
        )
        .filter((item) => item.inventoryIds.length > 0)
    );
  };

  // ------------------------------------------------
  // Remove product
  // ------------------------------------------------

  const removeProduct = (productId) => {
    setCart((current) =>
      current.filter((item) => item.productId !== productId)
    );
  };

  // ------------------------------------------------
  // Clear cart
  // ------------------------------------------------

  const clearCart = () => {
    setCart([]);
    setDiscount("0");
    setError("");
    setSuccess("");
    setLastSale(null);
  };
  // ------------------------------------------------
  // Create customer
  // ------------------------------------------------

  const handleCustomerChange = (event) => {
    const { name, value } = event.target;

    setCustomerForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateCustomer = () => {
    if (!customerForm.name.trim()) {
      return "Please enter the customer name.";
    }

    if (!/^\d{10}$/.test(customerForm.mobileNumber.trim())) {
      return "Enter a valid 10-digit mobile number.";
    }

    if (!customerForm.address.trim()) {
      return "Please enter the customer address.";
    }

    if (
      customerForm.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email.trim())
    ) {
      return "Please enter a valid email address.";
    }

    return "";
  };

  // ------------------------------------------------
  // Submit sale
  // ------------------------------------------------

  const handleCreateSale = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (cart.length === 0) {
      setError("Please add at least one product to the cart.");
      return;
    }

    if (!newCustomer && !customerId) {
      setError("Please select a customer.");
      return;
    }

    if (newCustomer) {
      const validationError = validateCustomer();

      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (discountAmount > subtotal) {
      setError("Discount cannot be greater than the subtotal.");
      return;
    }

    try {
      setSaving(true);

      let selectedCustomerId = customerId;

      // Create a customer first if requested.
      if (newCustomer) {
        const customerResponse = await api.post("/customers", {
          name: customerForm.name.trim(),
          mobile: customerForm.mobileNumber.trim(),
          email: customerForm.email.trim(),
          address: customerForm.address.trim(),
          aadhaarNumber: customerForm.aadhaarNumber.trim(),
          city: customerForm.city.trim(),
          state: customerForm.state.trim(),
          pincode: customerForm.pincode.trim(),
        });

        const createdCustomer =
          customerResponse.data?.customer ||
          customerResponse.data?.data;

        if (!createdCustomer?._id) {
          throw new Error(
            "Customer was created without a returned customer ID."
          );
        }

        selectedCustomerId = createdCustomer._id;

        setCustomers((current) => [
          ...current,
          createdCustomer,
        ]);

        setCustomerId(selectedCustomerId);
        setNewCustomer(false);
      }

      const salePayload = {
        customerId: selectedCustomerId,
        items: cart.flatMap((item) =>
          item.inventoryIds.map((inventoryId) => ({
            productId: item.productId,
            inventoryId,
            quantity: 1,
            price: item.price,
          }))
        ),
        discount: discountAmount,
        paymentMethod,
        totalAmount: total,
      };

      const response = await createSale(salePayload);

      const sale =
        response?.sale ||
        response?.data?.sale ||
        response?.data ||
        response;

      if (!sale) {
        throw new Error("The server did not return the sale details.");
      }

      setLastSale(sale);
      setSuccess("Sale created successfully!");
      setCart([]);
      setDiscount("0");

      await loadData();
    } catch (err) {
      console.error("Create sale error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to create sale. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // Complete payment
  // ------------------------------------------------

  const handleCompletePayment = async () => {
    if (!lastSale?._id) {
      setError("No sale is available for payment.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await completePayment(lastSale._id, {
        paymentMethod,
      });

      const updatedSale =
        response?.sale ||
        response?.data?.sale ||
        response?.data ||
        response;

      setLastSale(updatedSale || lastSale);
      setSuccess("Payment completed successfully.");
    } catch (err) {
      console.error("Payment error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to complete payment."
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // Reset new customer form
  // ------------------------------------------------

  const resetCustomerForm = () => {
    setCustomerForm({
      name: "",
      email: "",
      mobileNumber: "",
      address: "",
      aadhaarNumber: "",
      city: "",
      state: "",
      pincode: "",
    });
  };

  // ------------------------------------------------
  // Shared input styles
  // ------------------------------------------------

  const inputClass =
    "h-11 w-full min-w-0 rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] px-3.5 text-sm text-[#171914] outline-none transition duration-200 placeholder:text-[#918875] hover:border-[#D9AD35] focus:border-[#C99A24] focus:bg-[#FFFEFA] focus:ring-4 focus:ring-[#E9B83F]/15";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#514B3E]";

  // ------------------------------------------------
  // Page layout begins in Part 3
  // ------------------------------------------------
    // ------------------------------------------------
  // MAIN PAGE UI
  // ------------------------------------------------

  return (
    <div
      className="min-h-screen w-full min-w-0"
      style={{ backgroundColor: PAGE_BG }}
    >
      <Sidebar />

      <main
        className="box-border min-h-screen w-full min-w-0 px-3 pb-8 pt-20 sm:px-5 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:px-6 lg:pt-6 xl:px-8"
        style={{ backgroundColor: PAGE_BG }}
      >
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto w-full min-w-0 space-y-6"
        >
          {/* PAGE HEADER */}
          <motion.div
            variants={sectionVariants}
            className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#171914] sm:text-3xl">
                Create Sale (POS)
              </h1>

              <p className="mt-1 text-sm text-[#746D5E] sm:text-base">
                Add products and generate invoice
              </p>
            </div>

            <AnimatedButton
              onClick={clearCart}
              variant="gold"
              className="self-start sm:self-auto"
            >
              <Plus size={18} />
              New Sale
            </AnimatedButton>
          </motion.div>

          {/* NOTIFICATIONS */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="min-w-0 flex-1 break-words">
                  {error}
                </span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  className="rounded-lg p-1 hover:bg-red-100"
                >
                  <X size={17} />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
              >
                <CheckCircle2 size={18} className="shrink-0" />
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUMMARY CARDS */}
          <motion.div
            variants={sectionVariants}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <StatCard
              title="Available Inventory"
              value={formatNumber(
                inventory.filter(
                  (item) =>
                    item.status === "AVAILABLE" &&
                    Number(item.quantity ?? 1) > 0
                ).length
              )}
              icon={Package}
              subtitle="Units ready for sale"
            />

            <StatCard
              title="Cart Quantity"
              value={formatNumber(totalQuantity)}
              icon={ShoppingCart}
              subtitle="Units selected for this sale"
            />

            <StatCard
              title="Current Total"
              value={money(total)}
              icon={Receipt}
              subtitle="After discount"
            />
          </motion.div>

          {/* MAIN CONTENT */}
          <div className="grid min-w-0 grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.88fr)]">
            {/* PRODUCT SELECTION */}
            <motion.section
              variants={sectionVariants}
              className="min-w-0 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#171914]">
                  Select Products
                </h2>

                <span className="shrink-0 rounded-full bg-[#FFF5D6] px-3 py-1.5 text-xs font-bold text-[#8A650D]">
                  {products.reduce(
                    (sum, group) =>
                      sum +
                      group.inventoryItems.filter(
                        (item) =>
                          !cart.some((cartItem) =>
                            cartItem.inventoryIds.includes(item._id)
                          )
                      ).length,
                    0
                  )}{" "}
                  available
                </span>
              </div>

              {/* PRODUCT SEARCH */}
              <div className="relative mb-5">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A18B5D]"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product, model, or IMEI..."
                  aria-label="Search products"
                  className={`${inputClass} pl-12`}
                />
              </div>

              {/* PRODUCT LIST */}
              {loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <RefreshCw
                    size={28}
                    className="animate-spin text-[#C99A24]"
                  />
                </div>
              ) : products.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4F0E6] text-[#918875]">
                    <Smartphone size={28} />
                  </div>

                  <h3 className="font-bold text-[#171914]">
                    No available products found
                  </h3>

                  <p className="mt-2 max-w-sm text-sm text-[#746D5E]">
                    Check your inventory or change your search.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((group, index) => {
                    const { product, inventoryItems } = group;

                    const selectedIds = new Set(
                      cart.flatMap((item) => item.inventoryIds)
                    );

                    const availableCount =
                      inventoryItems.filter(
                        (item) => !selectedIds.has(item._id)
                      ).length;

                    const inCart = cart.find(
                      (item) => item.productId === product._id
                    );

                    return (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(index * 0.035, 0.2),
                          duration: 0.2,
                        }}
                        whileHover={{
                          y: -2,
                          borderColor: GOLD_COLOR,
                          boxShadow:
                            "0 8px 18px rgba(120, 91, 26, 0.07)",
                        }}
                        className="flex min-w-0 flex-col gap-4 rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FFF5D6] text-[#8A650D]">
                            <Smartphone size={23} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-bold text-[#171914]">
                              {getProductName(product)}
                            </h3>

                            <p className="mt-1 text-xs text-[#918875]">
                              {[
                                product.ram,
                                product.storage,
                                product.color,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "Mobile phone"}
                            </p>

                            <p className="mt-2 text-sm font-extrabold text-[#8A650D]">
                              {money(product.sellingPrice)}
                            </p>

                            {inCart && (
                              <p className="mt-1 text-xs text-[#746D5E]">
                                {inCart.inventoryIds.length} selected
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                          <span className="text-xs text-[#918875]">
                            {availableCount} available
                          </span>

                          <AnimatedButton
                            variant="outline"
                            disabled={availableCount === 0}
                            onClick={() => addProduct(group)}
                            className="px-3 py-2.5"
                          >
                            <Plus size={17} />
                            Add
                          </AnimatedButton>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.section>

            {/* CART */}
            <motion.section
              variants={sectionVariants}
              className="min-w-0 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="flex min-w-0 items-center gap-2 text-lg font-bold text-[#171914]">
                  <ShoppingCart size={21} />
                  <span>Cart Items ({totalQuantity})</span>
                </h2>

                <button
                  type="button"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#918875] transition-colors hover:text-[#8A650D] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <RotateCcw size={14} />
                  Clear All
                </button>
              </div>

              {/* CART ITEMS */}
              {cart.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-[#E6D9BD] bg-[#FBF8F0] px-4 py-8 text-center">
                  <ShoppingCart
                    size={31}
                    className="mb-3 text-[#B5AA95]"
                  />

                  <p className="text-sm font-semibold text-[#514B3E]">
                    Your cart is empty
                  </p>

                  <p className="mt-1 text-xs text-[#918875]">
                    Add products from the list.
                  </p>
                </div>
              ) : (
                <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.18 }}
                        className="rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF5D6] text-[#8A650D]">
                              <Smartphone size={20} />
                            </div>

                            <div className="min-w-0">
                              <p className="break-words text-sm font-bold text-[#171914]">
                                {item.name}
                              </p>

                              <p className="mt-1 text-xs text-[#918875]">
                                {money(item.price)} each
                              </p>

                              <p className="mt-1 text-xs text-[#746D5E]">
                                {item.inventoryIds.length} unit(s)
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeProduct(item.productId)}
                            aria-label={`Remove ${item.name}`}
                            className="shrink-0 rounded-lg p-2 text-[#A3A3A3] transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-3 border-t border-[#EAE1CF] pt-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item.productId, -1)
                              }
                              aria-label="Decrease quantity"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6D9BD] bg-[#FFFEFA] text-[#514B3E] transition-colors hover:bg-[#F4F0E6]"
                            >
                              <Minus size={15} />
                            </button>

                            <span className="min-w-5 text-center text-sm font-bold text-[#171914]">
                              {item.inventoryIds.length}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                changeQuantity(item.productId, 1)
                              }
                              aria-label="Increase quantity"
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E6D9BD] bg-[#FFFEFA] text-[#514B3E] transition-colors hover:border-[#D9AD35] hover:bg-[#FFF5D6]"
                            >
                              <Plus size={15} />
                            </button>
                          </div>

                          <p className="text-sm font-extrabold text-[#171914]">
                            {money(item.price * item.inventoryIds.length)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* CUSTOMER AND PAYMENT FORM CONTINUES IN PART 4 */}
                            {/* CUSTOMER SELECTION */}
              <div className="mt-6 border-t border-[#EAE1CF] pt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label
                    htmlFor="sale-customer"
                    className="flex items-center gap-2 text-sm font-bold text-[#171914]"
                  >
                    <UserRound size={18} />
                    Customer
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      setNewCustomer((previous) => !previous);
                      setError("");
                      setSuccess("");

                      if (!newCustomer) {
                        setCustomerId("");
                      } else {
                        resetCustomerForm();
                      }
                    }}
                    className="shrink-0 text-xs font-bold text-[#986900] transition-colors hover:text-[#6F4D00]"
                  >
                    {newCustomer ? "Select Existing" : "+ New Customer"}
                  </button>
                </div>

                {!newCustomer ? (
                  <select
                    id="sale-customer"
                    value={customerId}
                    onChange={(event) =>
                      setCustomerId(event.target.value)
                    }
                    className={inputClass}
                    required
                  >
                    <option value="">Select customer...</option>

                    {customers.map((customer) => (
                      <option
                        key={customer._id}
                        value={customer._id}
                      >
                        {customer.name} —{" "}
                        {customer.mobile ||
                          customer.mobileNumber ||
                          "No phone"}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="space-y-4 rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] p-4">
                    <div>
                      <label
                        htmlFor="new-customer-name"
                        className={labelClass}
                      >
                        Full Name *
                      </label>

                      <input
                        id="new-customer-name"
                        name="name"
                        value={customerForm.name}
                        onChange={handleCustomerChange}
                        placeholder="Enter customer name"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-customer-mobile"
                        className={labelClass}
                      >
                        Mobile Number *
                      </label>

                      <input
                        id="new-customer-mobile"
                        name="mobileNumber"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={customerForm.mobileNumber}
                        onChange={(event) =>
                          setCustomerForm((previous) => ({
                            ...previous,
                            mobileNumber: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          }))
                        }
                        placeholder="10-digit mobile number"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-customer-email"
                        className={labelClass}
                      >
                        Email Address
                      </label>

                      <input
                        id="new-customer-email"
                        name="email"
                        type="email"
                        value={customerForm.email}
                        onChange={handleCustomerChange}
                        placeholder="customer@example.com"
                        className={inputClass}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="new-customer-address"
                        className={labelClass}
                      >
                        Address *
                      </label>

                      <textarea
                        id="new-customer-address"
                        name="address"
                        rows={2}
                        value={customerForm.address}
                        onChange={handleCustomerChange}
                        placeholder="Enter customer address"
                        className={`${inputClass} h-auto min-h-20 resize-y py-3`}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="new-customer-city"
                          className={labelClass}
                        >
                          City
                        </label>

                        <input
                          id="new-customer-city"
                          name="city"
                          value={customerForm.city}
                          onChange={handleCustomerChange}
                          placeholder="City"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="new-customer-state"
                          className={labelClass}
                        >
                          State
                        </label>

                        <input
                          id="new-customer-state"
                          name="state"
                          value={customerForm.state}
                          onChange={handleCustomerChange}
                          placeholder="State"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="new-customer-pincode"
                          className={labelClass}
                        >
                          PIN Code
                        </label>

                        <input
                          id="new-customer-pincode"
                          name="pincode"
                          inputMode="numeric"
                          maxLength={6}
                          value={customerForm.pincode}
                          onChange={(event) =>
                            setCustomerForm((previous) => ({
                              ...previous,
                              pincode: event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 6),
                            }))
                          }
                          placeholder="PIN code"
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="new-customer-aadhaar"
                          className={labelClass}
                        >
                          Aadhaar Number
                        </label>

                        <input
                          id="new-customer-aadhaar"
                          name="aadhaarNumber"
                          type="password"
                          inputMode="numeric"
                          maxLength={12}
                          autoComplete="off"
                          value={customerForm.aadhaarNumber}
                          onChange={(event) =>
                            setCustomerForm((previous) => ({
                              ...previous,
                              aadhaarNumber: event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 12),
                            }))
                          }
                          placeholder="Optional"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD */}
              <div className="mt-6 border-t border-[#EAE1CF] pt-5">
                <label
                  htmlFor="payment-method"
                  className="mb-3 flex items-center gap-2 text-sm font-bold text-[#171914]"
                >
                  <CreditCard size={18} />
                  Payment Method
                </label>

                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="COD">Cash on Delivery</option>
                </select>
              </div>

              {/* DISCOUNT */}
              <div className="mt-6">
                <label
                  htmlFor="sale-discount"
                  className={labelClass}
                >
                  Discount Amount (₹)
                </label>

                <input
                  id="sale-discount"
                  type="number"
                  min="0"
                  max={subtotal}
                  step="1"
                  value={discount}
                  onChange={(event) => {
                    const value = event.target.value;

                    setDiscount(value);
                    setError("");
                  }}
                  placeholder="Enter discount amount"
                  className={inputClass}
                />

                <p className="mt-2 text-xs text-[#918875]">
                  Maximum discount: {money(subtotal)}
                </p>
              </div>

              {/* BILL SUMMARY */}
              <div className="mt-6 space-y-4 rounded-xl border border-[#E6D9BD] bg-[#F4F0E6] p-4 sm:p-5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-[#171914]">
                  <Receipt size={18} className="text-[#986900]" />
                  Bill Summary
                </h3>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#746D5E]">
                    Subtotal ({totalQuantity} units)
                  </span>

                  <span className="font-semibold text-[#171914]">
                    {money(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[#746D5E]">
                    Discount
                  </span>

                  <span className="font-semibold text-emerald-700">
                    - {money(discountAmount)}
                  </span>
                </div>

                <div className="border-t border-[#E6D9BD] pt-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold text-[#171914]">
                      Total Amount
                    </span>

                    <motion.span
                      key={total}
                      initial={{ opacity: 0.6, y: 3 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl font-extrabold text-[#8A650D]"
                    >
                      {money(total)}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* CREATE SALE BUTTON */}
              <form
                onSubmit={handleCreateSale}
                className="mt-5"
              >
                <AnimatedButton
                  type="submit"
                  disabled={saving || loading || cart.length === 0}
                  className="w-full py-3.5"
                >
                  {saving ? (
                    <>
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      Create Sale & Generate Invoice
                      <ArrowRight size={18} />
                    </>
                  )}
                </AnimatedButton>

                <p className="mt-3 text-center text-xs text-[#918875]">
                  Please verify the customer and payment details before
                  creating the sale.
                </p>
              </form>
            </motion.section>
          </div>

          {/* Part 5 continues with the invoice result and closing JSX. */}
                    {/* SALE SUCCESS / INVOICE RESULT */}
          <AnimatePresence>
            {lastSale && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden rounded-2xl border border-[#D9E9D8] bg-[#FFFEFA] shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-[#E6D9BD] bg-[#F4F0E6] p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={25} />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-[#171914]">
                        Sale Created Successfully
                      </h2>

                      <p className="mt-1 text-sm text-[#746D5E]">
                        Your sale details are ready.
                      </p>
                    </div>
                  </div>

                  <span className="self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:self-auto">
                    Sale Confirmed
                  </span>
                </div>

                <div className="space-y-5 p-5 sm:p-6">
                  {/* INVOICE DETAILS */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] p-4">
                      <p className="text-xs font-medium text-[#918875]">
                        Invoice / Sale ID
                      </p>

                      <p className="mt-2 break-all text-sm font-bold text-[#171914]">
                        {lastSale.invoiceNumber ||
                          lastSale.saleNumber ||
                          lastSale._id ||
                          "Generated"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] p-4">
                      <p className="text-xs font-medium text-[#918875]">
                        Total Amount
                      </p>

                      <p className="mt-2 text-xl font-extrabold text-[#8A650D]">
                        {money(
                          lastSale.totalAmount ??
                            lastSale.total ??
                            total
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] p-4">
                      <p className="text-xs font-medium text-[#918875]">
                        Payment Method
                      </p>

                      <p className="mt-2 text-sm font-bold text-[#171914]">
                        {lastSale.paymentMethod || paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* SALE ACTIONS */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    {lastSale.paymentStatus !== "PAID" &&
                      lastSale.status !== "COMPLETED" && (
                        <AnimatedButton
                          onClick={handleCompletePayment}
                          disabled={saving}
                          variant="gold"
                        >
                          {saving ? (
                            <RefreshCw
                              size={17}
                              className="animate-spin"
                            />
                          ) : (
                            <CreditCard size={17} />
                          )}

                          Complete Payment
                        </AnimatedButton>
                      )}

                    <AnimatedButton
                      variant="outline"
                      onClick={() => {
                        window.print();
                      }}
                    >
                      <Receipt size={17} />
                      Print Invoice
                    </AnimatedButton>

                    <AnimatedButton
                      variant="outline"
                      onClick={() => {
                        setLastSale(null);
                        setSuccess("");
                        setError("");
                      }}
                    >
                      <Plus size={17} />
                      Start Another Sale
                    </AnimatedButton>
                  </div>

                  <p className="text-xs leading-5 text-[#918875]">
                    Payment completion and invoice printing depend on the
                    sale details returned by your backend. Use your
                    existing invoice component if your project already
                    has one.
                  </p>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}
