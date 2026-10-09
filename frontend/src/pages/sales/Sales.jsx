
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      staggerChildren: 0.08,
    },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

const buttonTransition = {
  type: "spring",
  stiffness: 350,
  damping: 18,
};

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
    dark: "bg-[#171717] text-white hover:bg-[#333333]",
    gold: "bg-[#F4C64E] text-black hover:bg-[#E7B83B]",
    outline:
      "border border-gray-200 bg-white text-gray-700 hover:border-[#D4AF37] hover:bg-amber-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              y: -3,
              scale: 1.025,
              rotateX: -3,
              rotateY: 2,
            }
      }
      whileTap={disabled ? undefined : { scale: 0.96, y: 1 }}
      transition={buttonTransition}
      style={{ transformStyle: "preserve-3d" }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

// --------------------------------------------------
// Animated Stat
// --------------------------------------------------

function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <motion.div
      variants={sectionVariants}
      whileHover={{
        y: -5,
        rotateX: 2,
        rotateY: -2,
        scale: 1.015,
      }}
      transition={buttonTransition}
      style={{ transformStyle: "preserve-3d" }}
      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-xl sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-2xl font-extrabold tracking-tight text-[#171717]"
          >
            {value}
          </motion.p>

          <p className="mt-2 text-xs text-gray-400">{subtitle}</p>
        </div>

        <motion.div
          whileHover={{ rotate: 10, scale: 1.12 }}
          transition={buttonTransition}
          className="rounded-xl bg-amber-50 p-3 text-amber-700"
        >
          <Icon size={22} />
        </motion.div>
      </div>
    </motion.div>
  );
}

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
    (total, item) =>
      total + item.price * item.inventoryIds.length,
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

  const createNewCustomer = async () => {
    const response = await api.post("/customers", customerForm);
    const created = response.data.customer;

    setCustomers((current) => [created, ...current]);
    setCustomerId(created._id);
    setNewCustomer(false);

    return created._id;
  };

  // ------------------------------------------------
  // Save sale
  // ------------------------------------------------

  const handleSaveSale = async () => {
    setError("");
    setSuccess("");
    setLastSale(null);

    if (cart.length === 0) {
      setError("Please add at least one product to the cart.");
      return;
    }

    if (discountAmount > subtotal) {
      setError("Discount cannot be greater than the subtotal.");
      return;
    }

    if (!customerId && !newCustomer) {
      setError("Please select a customer or add a new customer.");
      return;
    }

    if (
      newCustomer &&
      (!customerForm.name.trim() ||
        !customerForm.mobileNumber.trim() ||
        !customerForm.address.trim())
    ) {
      setError(
        "Customer name, mobile number, and address are required."
      );
      return;
    }

    setSaving(true);

    try {
      let selectedCustomerId = customerId;

      if (newCustomer) {
        selectedCustomerId = await createNewCustomer();
      }

      const inventoryIds = cart.flatMap(
        (item) => item.inventoryIds
      );

      const response = await createSale({
        inventoryIds,
        customerId: selectedCustomerId,
        discount: discountAmount,
        paymentMethod,
      });

      const sale = response.sale;

      setLastSale(sale);

      setSuccess(
        `Sale ${sale.invoiceNumber} saved. Payment is pending.`
      );

      await loadData();

      return sale;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Could not save the sale. Please check the backend response."
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // Proceed to payment
  // ------------------------------------------------

  const handleProceedToPayment = async () => {
    let sale = lastSale;

    if (!sale) {
      sale = await handleSaveSale();
    }

    if (!sale) return;

    if (!sale.paymentId) {
      setError(
        "The sale response did not include a payment ID. Check your sale API response."
      );
      return;
    }

    if (paymentMethod === "COD") {
      setSuccess(
        `Sale ${sale.invoiceNumber} is saved with Cash on Delivery. Complete payment when received.`
      );
      return;
    }

    const confirmed = window.confirm(
      `Confirm that the customer has paid ${money(
        sale.amount ?? total
      )} using ${paymentMethod}?`
    );

    if (!confirmed) return;

    setSaving(true);
    setError("");

    try {
      await completePayment(sale.paymentId);

      setSuccess(
        `Payment completed successfully for ${sale.invoiceNumber}.`
      );

      setCart([]);
      setDiscount("0");
      setLastSale(null);

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Payment could not be completed."
      );
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------------------------
  // Render
  // ------------------------------------------------

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191919]">
      <Sidebar />

      <main className="min-h-screen p-4 sm:p-6 lg:ml-[250px] lg:p-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[1600px]"
        >
          {/* Header */}
          <motion.header
            variants={sectionVariants}
            className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              

              <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Create Sale (POS)
               
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Add products and generate invoice
              </p>
            </div>

            <AnimatedButton
              variant="gold"
              onClick={() => {
                clearCart();
                loadData();
              }}
            >
              <Plus size={18} />
              New Sale
            </AnimatedButton>
          </motion.header>

          {/* Statistics */}
          <motion.div
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <StatCard
              title="Available Inventory"
              value={inventory.filter(
                (item) => item.status === "AVAILABLE"
              ).length}
              subtitle="Units ready for sale"
              icon={Package}
            />

            <StatCard
              title="Cart Quantity"
              value={totalQuantity}
              subtitle="Units selected for this sale"
              icon={ShoppingCart}
            />

            <StatCard
              title="Current Total"
              value={money(total)}
              subtitle="After discount"
              icon={Receipt}
            />
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span className="flex-1">{error}</span>

                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                >
                  <X size={17} />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success message */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                className="mb-5 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"
              >
                <CheckCircle2
                  size={18}
                  className="mt-0.5 shrink-0"
                />
                <span className="flex-1">{success}</span>

                <button
                  type="button"
                  onClick={() => setSuccess("")}
                  aria-label="Dismiss success"
                >
                  <X size={17} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main layout */}
          <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(390px,0.85fr)]">
            {/* Product catalogue */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ boxShadow: "0 15px 35px rgba(15,23,42,0.04)" }}
              className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold">
                  Select Products
                </h2>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                  {inventory.filter(
                    (item) => item.status === "AVAILABLE"
                  ).length}{" "}
                  available
                </span>
              </div>

              {/* Search */}
              <div className="relative mb-5">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product, model, or IMEI..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>

              {/* Product loading */}
              {loading ? (
                <div className="flex min-h-56 items-center justify-center gap-3 text-sm text-gray-500">
                  <RefreshCw size={19} className="animate-spin" />
                  Loading available products...
                </div>
              ) : products.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex min-h-56 flex-col items-center justify-center text-center"
                >
                  <Smartphone
                    size={35}
                    className="mb-3 text-gray-300"
                  />

                  <p className="font-semibold">
                    No available products found
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Check your inventory or change your search.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {products.map(({ product, inventoryItems }, index) => {
                      const cartItem = cart.find(
                        (item) => item.productId === product._id
                      );

                      const quantity =
                        cartItem?.inventoryIds.length || 0;

                      const alreadySelected = new Set(
                        cart.flatMap((item) => item.inventoryIds)
                      );

                      const availableCount =
                        inventoryItems.filter(
                          (item) => !alreadySelected.has(item._id)
                        ).length;

                      return (
                        <motion.div
                          layout
                          key={product._id}
                          initial={{
                            opacity: 0,
                            y: 20,
                            scale: 0.97,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            x: -20,
                            scale: 0.95,
                          }}
                          transition={{
                            ...buttonTransition,
                            delay: Math.min(index * 0.035, 0.2),
                          }}
                          whileHover={{
                            y: -4,
                            rotateX: 2,
                            rotateY: -1,
                            scale: 1.005,
                          }}
                          style={{ transformStyle: "preserve-3d" }}
                          className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition-shadow hover:border-amber-300 hover:shadow-lg sm:gap-4 sm:p-4"
                        >
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gray-100">
                            {product.image ? (
                              <img
                                src={
                                  product.image.startsWith("http")
                                    ? product.image
                                    : `http://localhost:5000/${product.image.replace(/^\/+/, "")}`
                                }
                                alt={getProductName(product)}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Smartphone
                                size={26}
                                className="text-gray-400"
                              />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-sm font-semibold sm:text-base">
                              {getProductName(product)}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {[
                                product.ram,
                                product.storage,
                                product.color,
                              ]
                                .filter(Boolean)
                                .join(" • ") || "Mobile phone"}
                            </p>

                            <p className="mt-2 font-bold text-[#171717]">
                              {money(product.sellingPrice)}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {availableCount} available
                            </p>
                          </div>

                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <motion.button
                              type="button"
                              disabled={availableCount === 0}
                              onClick={() =>
                                addProduct({ product, inventoryItems })
                              }
                              whileHover={
                                availableCount > 0
                                  ? { scale: 1.08, y: -2 }
                                  : {}
                              }
                              whileTap={{ scale: 0.92 }}
                              transition={buttonTransition}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[#171717] px-3 py-2.5 text-xs font-bold text-white shadow-md transition-colors hover:bg-amber-400 hover:text-black disabled:cursor-not-allowed disabled:bg-gray-300 sm:px-4 sm:text-sm"
                            >
                              <motion.span
                                whileHover={{ rotate: 90 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Plus size={16} />
                              </motion.span>
                              Add
                            </motion.button>

                            <AnimatePresence>
                              {quantity > 0 && (
                                <motion.span
                                  initial={{ opacity: 0, scale: 0.7 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.7 }}
                                  className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900"
                                >
                                  {quantity} in cart
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </motion.section>

            {/* Cart and billing */}
            <motion.section
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} />

                  <h2 className="text-lg font-bold">
                    Cart Items ({totalQuantity})
                  </h2>
                </div>

                <motion.button
                  type="button"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 transition hover:text-red-700 disabled:text-gray-300"
                >
                  <RotateCcw size={14} />
                  Clear All
                </motion.button>
              </div>

              {/* Cart items */}
              {cart.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 text-center"
                >
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ShoppingCart
                      size={30}
                      className="mb-2 text-gray-300"
                    />
                  </motion.div>

                  <p className="text-sm font-semibold text-gray-600">
                    Your cart is empty
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Add products from the list.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="popLayout">
                    {cart.map((item) => (
                      <motion.div
                        layout
                        key={item.productId}
                        initial={{
                          opacity: 0,
                          x: 30,
                          scale: 0.95,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          x: -30,
                          scale: 0.9,
                        }}
                        transition={buttonTransition}
                        className="flex items-center gap-3 border-b border-gray-100 pb-4"
                      >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-800">
                          <Smartphone size={22} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold">
                            {item.name}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {money(item.price)} each
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {item.inventoryIds.length} individual phone(s)
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() =>
                              changeQuantity(item.productId, -1)
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 transition hover:border-amber-300 hover:bg-amber-50"
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <Minus size={14} />
                          </motion.button>

                          <motion.span
                            key={item.inventoryIds.length}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            className="min-w-4 text-center text-sm font-bold"
                          >
                            {item.inventoryIds.length}
                          </motion.span>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() =>
                              changeQuantity(item.productId, 1)
                            }
                            disabled={
                              !products.some(
                                (group) =>
                                  group.product._id === item.productId &&
                                  group.inventoryItems.some(
                                    (phone) =>
                                      !cart.some((cartProduct) =>
                                        cartProduct.inventoryIds.includes(
                                          phone._id
                                        )
                                      )
                                  )
                              )
                            }
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 transition hover:border-amber-300 hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <Plus size={14} />
                          </motion.button>
                        </div>

                        <div className="w-20 text-right">
                          <p className="text-sm font-bold">
                            {money(item.price * item.inventoryIds.length)}
                          </p>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.15, rotate: -8 }}
                            whileTap={{ scale: 0.85 }}
                            onClick={() => removeProduct(item.productId)}
                            className="mt-2 text-gray-400 transition hover:text-red-600"
                            aria-label={`Remove ${item.name}`}
                          >
                            <Trash2 size={16} className="ml-auto" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Customer selection */}
              <div className="mt-6 border-t border-gray-100 pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-bold">
                    <UserRound size={17} />
                    Customer
                  </label>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setNewCustomer((value) => !value)}
                    className="text-xs font-semibold text-[#9B7613] hover:underline"
                  >
                    {newCustomer ? "Choose existing" : "+ New Customer"}
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {newCustomer ? (
                    <motion.div
                      key="new-customer"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                    >
                      {[
                        ["name", "Full name", "text"],
                        ["mobileNumber", "Mobile number", "tel"],
                        ["address", "Address", "text"],
                        [
                          "aadhaarNumber",
                          "Aadhaar number (optional)",
                          "text",
                        ],
                        ["city", "City", "text"],
                        ["state", "State", "text"],
                        ["pincode", "PIN code", "text"],
                      ].map(([field, placeholder, type]) => (
                        <input
                          key={field}
                          type={type}
                          value={customerForm[field]}
                          onChange={(event) =>
                            setCustomerForm((current) => ({
                              ...current,
                              [field]: event.target.value,
                            }))
                          }
                          placeholder={placeholder}
                          className={`w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100 ${
                            field === "address" ? "sm:col-span-2" : ""
                          }`}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <motion.select
                      key="existing-customer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      value={customerId}
                      onChange={(event) =>
                        setCustomerId(event.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100"
                    >
                      <option value="">Select customer...</option>

                      {customers.map((customer) => (
                        <option
                          key={customer._id}
                          value={customer._id}
                        >
                          {customer.name} — {customer.mobileNumber}
                        </option>
                      ))}
                    </motion.select>
                  )}
                </AnimatePresence>
              </div>

              {/* Payment method */}
              <div className="mt-5">
                <label className="mb-2 flex items-center gap-2 text-sm font-bold">
                  <CreditCard size={17} />
                  Payment Method
                </label>

                <select
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(event.target.value)
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100"
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI</option>
                  <option value="CARD">Card</option>
                  <option value="ONLINE">Online</option>
                  <option value="COD">Cash on Delivery</option>
                </select>
              </div>

              {/* Bill summary */}
              <motion.div
                layout
                className="mt-6 space-y-4 rounded-xl bg-[#F8F9FA] p-4 sm:p-5"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>

                  <motion.span
                    key={subtotal}
                    initial={{ opacity: 0.5, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-semibold"
                  >
                    {money(subtotal)}
                  </motion.span>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <label htmlFor="sale-discount" className="text-gray-600">
                    Discount (₹)
                  </label>

                  <input
                    id="sale-discount"
                    type="number"
                    min="0"
                    max={subtotal}
                    value={discount}
                    onChange={(event) => setDiscount(event.target.value)}
                    className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-right outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-bold">Total Amount</span>

                  <motion.span
                    key={total}
                    initial={{ opacity: 0.5, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xl font-extrabold text-[#171717]"
                  >
                    {money(total)}
                  </motion.span>
                </div>
              </motion.div>

              {/* Action buttons */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <AnimatedButton
                  variant="outline"
                  disabled={
                    saving ||
                    cart.length === 0 ||
                    Boolean(lastSale)
                  }
                  onClick={handleSaveSale}
                  className="py-3.5"
                >
                  {saving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Receipt size={16} />
                  )}
                  Save Sale
                </AnimatedButton>

                <AnimatedButton
                  variant="dark"
                  disabled={saving || cart.length === 0}
                  onClick={handleProceedToPayment}
                  className="py-3.5"
                >
                  {saving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  Proceed to Payment
                  <ArrowRight size={16} />
                </AnimatedButton>
              </div>

              {/* Saved sale */}
              <AnimatePresence>
                {lastSale && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.98 }}
                    className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm"
                  >
                    <div className="flex items-center gap-2 font-bold text-green-800">
                      <CheckCircle2 size={18} />
                      Sale saved successfully
                    </div>

                    <p className="mt-2 text-green-700">
                      Invoice: {lastSale.invoiceNumber}
                    </p>

                    <p className="mt-1 text-green-700">
                      Payment: Pending
                    </p>

                    <motion.button
                      type="button"
                      whileHover={{ x: 3 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        clearCart();
                        loadData();
                      }}
                      className="mt-3 inline-flex items-center gap-1 font-semibold text-green-800 underline"
                    >
                      Start another sale
                      <ArrowRight size={14} />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
