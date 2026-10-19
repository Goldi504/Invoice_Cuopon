import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Package,
  Search,
  RefreshCw,
  Plus,
  Minus,
  X,
  AlertTriangle,
  Smartphone,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/layout/Sidebar";
import {
  getInventory,
  addStock,
  removeStock,
  updateLowStockLimit,
} from "../../services/inventoryService";

// =====================================================
// THEME COLORS — MATCH DASHBOARD
// =====================================================

const PAGE_BG = "#F4F0E6";
const CARD_BG = "#FFFEFA";
const GOLD = "#C99A24";

// =====================================================
// STOCK STATUS
// =====================================================

const getStockStatus = (quantity, lowStockLimit) => {
  const stock = Number(quantity || 0);
  const limit = Number(lowStockLimit || 0);

  if (stock === 0) {
    return {
      label: "Out of Stock",
      className: "border-red-200 bg-red-50 text-red-700",
      dot: "bg-red-500",
    };
  }

  if (stock <= limit) {
    return {
      label: "Low Stock",
      className: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    };
  }

  return {
    label: "In Stock",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  };
};

// =====================================================
// NUMBER FORMATTER
// =====================================================

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

// =====================================================
// INPUT STYLES
// =====================================================

const inputClass =
  "w-full min-w-0 rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] px-3 py-3 text-sm text-[#171914] outline-none transition duration-200 placeholder:text-[#918875] focus:border-[#C99A24] focus:bg-[#FFFEFA] focus:ring-4 focus:ring-[#E9B83F]/20";

// =====================================================
// INVENTORY COMPONENT
// =====================================================

function Inventory() {
  // ---------------------------------------------------
  // USER
  // ---------------------------------------------------

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  // ---------------------------------------------------
  // INVENTORY DATA
  // ---------------------------------------------------

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------
  // SEARCH AND FILTER
  // ---------------------------------------------------

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ---------------------------------------------------
  // NOTIFICATIONS
  // ---------------------------------------------------

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ---------------------------------------------------
  // STOCK MODAL
  // ---------------------------------------------------

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAction, setStockAction] = useState("ADD");
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  // ---------------------------------------------------
  // LOW STOCK LIMIT MODAL
  // ---------------------------------------------------

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitValue, setLimitValue] = useState("");
  const [updatingLimit, setUpdatingLimit] = useState(false);

  // ---------------------------------------------------
  // LOAD INVENTORY
  // ---------------------------------------------------

  const loadInventory = useCallback(async (refresh = false) => {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getInventory();

      if (data?.success) {
        setInventory(data.inventory || []);
      } else {
        setError(data?.message || "Failed to load inventory.");
      }
    } catch (err) {
      console.error("Inventory error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load inventory."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ---------------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------------

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  // ---------------------------------------------------
  // FILTER INVENTORY
  // ---------------------------------------------------

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const product = item.product;

      if (!product) return false;

      const searchableText = [
        product.brand,
        product.model,
        product.barcode,
        product.category,
        item.imei,
        item.serialNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const status = getStockStatus(
        item.quantity,
        item.lowStockLimit
      );

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "IN_STOCK" &&
          status.label === "In Stock") ||
        (statusFilter === "LOW_STOCK" &&
          status.label === "Low Stock") ||
        (statusFilter === "OUT_OF_STOCK" &&
          status.label === "Out of Stock");

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

  // ---------------------------------------------------
  // INVENTORY STATISTICS
  // ---------------------------------------------------

  const totalProducts = inventory.length;

  const totalStock = inventory.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const lowStockCount = inventory.filter((item) => {
    const quantity = Number(item.quantity || 0);
    const limit = Number(item.lowStockLimit || 0);

    return quantity > 0 && quantity <= limit;
  }).length;

  const outOfStockCount = inventory.filter(
    (item) => Number(item.quantity || 0) === 0
  ).length;

  // ---------------------------------------------------
  // OPEN STOCK MODAL
  // ---------------------------------------------------

  const openStockModal = (item, action) => {
    setSelectedItem(item);
    setStockAction(action);
    setStockQuantity("");
    setError("");
    setSuccess("");
    setShowStockModal(true);
  };

  // ---------------------------------------------------
  // OPEN LOW STOCK LIMIT MODAL
  // ---------------------------------------------------

  const openLimitModal = (item) => {
    setSelectedItem(item);
    setLimitValue(String(item.lowStockLimit ?? 5));
    setError("");
    setShowLimitModal(true);
  };

  // ---------------------------------------------------
  // UPDATE STOCK
  // ---------------------------------------------------

  const handleStockUpdate = async (event) => {
    event.preventDefault();

    if (!selectedItem) return;

    const quantity = Number(stockQuantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      setError("Enter a valid positive quantity.");
      return;
    }

    if (
      stockAction === "REMOVE" &&
      quantity > Number(selectedItem.quantity || 0)
    ) {
      setError("You cannot remove more stock than is available.");
      return;
    }

    try {
      setUpdatingStock(true);
      setError("");
      setSuccess("");

      const productId = selectedItem.product?._id;

      if (!productId) {
        throw new Error("Product ID was not found.");
      }

      const result =
        stockAction === "ADD"
          ? await addStock(productId, quantity)
          : await removeStock(productId, quantity);

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to update stock."
        );
      }

      setShowStockModal(false);
      setSuccess(result.message || "Stock updated successfully.");

      await loadInventory(true);
    } catch (err) {
      console.error("Stock update error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update stock."
      );
    } finally {
      setUpdatingStock(false);
    }
  };

  // ---------------------------------------------------
  // UPDATE LOW STOCK LIMIT
  // ---------------------------------------------------

  const handleLimitUpdate = async (event) => {
    event.preventDefault();

    if (!selectedItem) return;

    const limit = Number(limitValue);

    if (!Number.isInteger(limit) || limit < 0) {
      setError(
        "The low-stock limit must be zero or a positive number."
      );
      return;
    }

    try {
      setUpdatingLimit(true);
      setError("");

      const productId = selectedItem.product?._id;

      if (!productId) {
        throw new Error("Product ID was not found.");
      }

      const result = await updateLowStockLimit(productId, limit);

      if (!result?.success) {
        throw new Error(
          result?.message || "Failed to update low-stock limit."
        );
      }

      setShowLimitModal(false);
      setSuccess("Low-stock limit updated successfully.");

      await loadInventory(true);
    } catch (err) {
      console.error("Low-stock limit error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update low-stock limit."
      );
    } finally {
      setUpdatingLimit(false);
    }
  };

  // ---------------------------------------------------
  // STAT CARDS
  // ---------------------------------------------------

  const stats = [
    {
      title: "Products",
      value: totalProducts,
      description: "Products in inventory",
      icon: Package,
      iconClass: "bg-[#FFF1C6] text-[#986900]",
    },
    {
      title: "Total Stock",
      value: totalStock,
      description: "Available units",
      icon: Boxes,
      iconClass: "bg-[#E2F4E8] text-[#087A4B]",
    },
    {
      title: "Low Stock",
      value: lowStockCount,
      description: "Need attention",
      icon: AlertTriangle,
      iconClass: "bg-[#FFF1C6] text-[#986900]",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      description: "Currently unavailable",
      icon: ShieldAlert,
      iconClass: "bg-[#FDE8E7] text-[#C9342D]",
    },
  ];

  // Part 2 continues with the page UI, cards, search, and inventory table.
    // =====================================================
  // MAIN UI
  // =====================================================

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
        <div className="mx-auto w-full min-w-0 space-y-5 sm:space-y-6">
          {/* PAGE HEADER */}
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[#171914] sm:text-3xl">
                Inventory
              </h1>

              <p className="mt-1 text-sm text-[#746D5E]">
                Manage your shop stock and inventory
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => loadInventory(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] px-4 py-2.5 text-sm font-semibold text-[#514B3E] shadow-sm transition-colors hover:border-[#D9AD35] hover:bg-[#FFF5D6] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </motion.button>
          </div>

          {/* NOTIFICATIONS */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex min-w-0 items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4"
              >
                <AlertTriangle
                  size={18}
                  className="mt-0.5 shrink-0"
                />

                <span className="min-w-0 flex-1 break-words">
                  {error}
                </span>

                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss error"
                  className="shrink-0 rounded-lg p-1 hover:bg-red-100"
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
                className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 sm:p-4"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* SUMMARY CARDS */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA]"
                />
              ))}
            </div>
          ) : (
            <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{
                      y: -4,
                      boxShadow:
                        "0 12px 24px rgba(120, 91, 26, 0.10)",
                      borderColor: GOLD,
                    }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.22,
                      ease: "easeOut",
                    }}
                    className="min-w-0 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-[#746D5E]">
                        {stat.title}
                      </p>

                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>

                    <p className="mt-1 text-2xl font-bold text-[#171914] sm:text-3xl">
                      {formatNumber(stat.value)}
                    </p>

                    <p className="mt-3 text-xs text-[#918875]">
                      {stat.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* SEARCH AND FILTER */}
          <motion.section
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="min-w-0 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-3 shadow-sm sm:p-4"
          >
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] px-3 transition-colors focus-within:border-[#C99A24] focus-within:ring-4 focus-within:ring-[#E9B83F]/15 sm:px-4">
                <Search
                  size={19}
                  className="shrink-0 text-[#A18B5D]"
                />

                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by brand, model or barcode..."
                  aria-label="Search inventory"
                  className="w-full min-w-0 bg-transparent text-sm text-[#171914] outline-none placeholder:text-[#918875]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="shrink-0 text-[#918875] transition-colors hover:text-[#171914]"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter inventory by stock status"
                className="h-12 w-full rounded-xl border border-[#E6D9BD] bg-[#FBF8F0] px-3 text-sm text-[#514B3E] outline-none transition-colors focus:border-[#C99A24] focus:ring-4 focus:ring-[#E9B83F]/15 sm:w-48"
              >
                <option value="ALL">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <p className="mt-3 text-xs text-[#918875]">
              Showing {filteredInventory.length} of {inventory.length} products
            </p>
          </motion.section>

          {/* INVENTORY TABLE */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-sm">
            {loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <Loader2
                  className="animate-spin text-[#C99A24]"
                  size={30}
                />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F4EBD8] text-[#918875]">
                  <Smartphone size={27} />
                </div>

                <h2 className="font-semibold text-[#171914]">
                  No inventory found
                </h2>

                <p className="mt-1 max-w-sm text-sm text-[#746D5E]">
                  {search || statusFilter !== "ALL"
                    ? "Try changing your search or status filter."
                    : "Inventory items will appear here when stock is available."}
                </p>

                {(search || statusFilter !== "ALL") && (
                  <motion.button
                    type="button"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-4 rounded-lg bg-[#FFF1C6] px-4 py-2 text-sm font-semibold text-[#79570A] transition-colors hover:bg-[#F8E8B8]"
                  >
                    Clear filters
                  </motion.button>
                )}
              </div>
            ) : (
              <>
                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead className="bg-[#F4F0E6]">
                      <tr className="border-b border-[#E6D9BD] text-xs uppercase tracking-wider text-[#746D5E]">
                        <th className="px-5 py-4 font-semibold">
                          Product
                        </th>
                        <th className="px-4 py-4 font-semibold">
                          Category
                        </th>
                        <th className="px-4 py-4 font-semibold">
                          Stock
                        </th>
                        <th className="px-4 py-4 font-semibold">
                          Status
                        </th>
                        <th className="px-4 py-4 font-semibold">
                          Low Limit
                        </th>
                        <th className="px-5 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EAE1CF]">
                      {filteredInventory.map((item, index) => {
                        const product = item.product || {};

                        const status = getStockStatus(
                          item.quantity,
                          item.lowStockLimit
                        );

                        return (
                          <motion.tr
                            key={item._id || product._id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              delay: Math.min(index * 0.025, 0.2),
                              duration: 0.2,
                            }}
                            className="transition-colors duration-200 hover:bg-[#FBF5E8]"
                          >
                            {/* PRODUCT */}
                            <td className="px-5 py-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F4EBD8] text-[#7B6A45]">
                                  <Smartphone size={20} />
                                </div>

                                <div className="min-w-0">
                                  <p className="max-w-[230px] truncate text-sm font-semibold text-[#171914]">
                                    {[product.brand, product.model]
                                      .filter(Boolean)
                                      .join(" ") || "Unnamed product"}
                                  </p>

                                  <p className="mt-1 text-xs text-[#918875]">
                                    {product.barcode ||
                                      item.imei ||
                                      item.serialNumber ||
                                      "No barcode"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}
                            <td className="px-4 py-4">
                              <span className="inline-flex max-w-36 truncate rounded-lg bg-[#F4F0E6] px-2.5 py-1.5 text-xs font-medium text-[#5E574B]">
                                {product.category || "Uncategorized"}
                              </span>
                            </td>

                            {/* STOCK */}
                            <td className="px-4 py-4">
                              <p className="text-base font-bold text-[#171914]">
                                {formatNumber(item.quantity)}
                              </p>
                              <p className="text-xs text-[#918875]">
                                units
                              </p>
                            </td>

                            {/* STATUS */}
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${status.className}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${status.dot}`}
                                />
                                {status.label}
                              </span>
                            </td>

                            {/* LOW STOCK LIMIT */}
                            <td className="px-4 py-4">
                              <span className="text-sm font-semibold text-[#514B3E]">
                                {formatNumber(item.lowStockLimit)}
                              </span>
                            </td>

                            {/* ACTIONS */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <motion.button
                                  type="button"
                                  title="Add stock"
                                  aria-label={`Add stock for ${product.model || product.brand || "product"}`}
                                  whileHover={{ y: -2, scale: 1.04 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    openStockModal(item, "ADD")
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition-colors hover:bg-emerald-100"
                                >
                                  <Plus size={17} />
                                </motion.button>

                                <motion.button
                                  type="button"
                                  title="Remove stock"
                                  aria-label={`Remove stock for ${product.model || product.brand || "product"}`}
                                  whileHover={{ y: -2, scale: 1.04 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    openStockModal(item, "REMOVE")
                                  }
                                  disabled={
                                    Number(item.quantity || 0) === 0
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Minus size={17} />
                                </motion.button>

                                {isAdmin && (
                                  <motion.button
                                    type="button"
                                    title="Update low-stock limit"
                                    aria-label="Update low-stock limit"
                                    whileHover={{ y: -2, scale: 1.04 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() =>
                                      openLimitModal(item)
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E6D9BD] bg-[#FFFEFA] text-[#986900] transition-colors hover:border-[#D9AD35] hover:bg-[#FFF5D6]"
                                  >
                                    <ShieldAlert size={17} />
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-[#EAE1CF] bg-[#FFFEFA] px-4 py-3 text-xs text-[#918875] sm:px-5">
                  On smaller screens, swipe horizontally to view all table columns.
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Part 3 continues with both modals and the component closing code. */}
            {/* =====================================================
          ADD / REMOVE STOCK MODAL
      ===================================================== */}

      <AnimatePresence>
        {showStockModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171914]/40 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget && !updatingStock) {
                setShowStockModal(false);
                setError("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#EAE1CF] px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-[#171914]">
                    {stockAction === "ADD" ? "Add Stock" : "Remove Stock"}
                  </h2>

                  <p className="mt-1 text-sm text-[#746D5E]">
                    {selectedItem.product?.brand}{" "}
                    {selectedItem.product?.model}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={updatingStock}
                  onClick={() => {
                    setShowStockModal(false);
                    setError("");
                  }}
                  aria-label="Close stock modal"
                  className="rounded-lg p-2 text-[#918875] transition-colors hover:bg-[#F4F0E6] hover:text-[#171914] disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleStockUpdate} className="space-y-5 p-5">
                <div className="rounded-xl border border-[#E6D9BD] bg-[#F4F0E6] p-4">
                  <p className="text-sm text-[#746D5E]">
                    Current available stock
                  </p>

                  <p className="mt-1 text-2xl font-bold text-[#171914]">
                    {formatNumber(selectedItem.quantity)} units
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="stock-quantity"
                    className="mb-2 block text-sm font-semibold text-[#514B3E]"
                  >
                    Quantity *
                  </label>

                  <input
                    id="stock-quantity"
                    type="number"
                    min="1"
                    step="1"
                    value={stockQuantity}
                    onChange={(event) =>
                      setStockQuantity(event.target.value)
                    }
                    placeholder="Enter quantity"
                    className={inputClass}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={updatingStock}
                    onClick={() => {
                      setShowStockModal(false);
                      setError("");
                    }}
                    className="rounded-xl border border-[#E6D9BD] px-5 py-3 text-sm font-semibold text-[#514B3E] transition-colors hover:bg-[#F4F0E6] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={updatingStock}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                      stockAction === "ADD"
                        ? "bg-emerald-600 hover:bg-emerald-700"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    {updatingStock ? (
                      <Loader2 size={17} className="animate-spin" />
                    ) : stockAction === "ADD" ? (
                      <Plus size={17} />
                    ) : (
                      <Minus size={17} />
                    )}

                    {updatingStock
                      ? "Updating..."
                      : stockAction === "ADD"
                      ? "Add Stock"
                      : "Remove Stock"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          LOW STOCK LIMIT MODAL
      ===================================================== */}

      <AnimatePresence>
        {showLimitModal && selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#171914]/40 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget && !updatingLimit) {
                setShowLimitModal(false);
                setError("");
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-md overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#EAE1CF] px-5 py-4">
                <div>
                  <h2 className="text-lg font-bold text-[#171914]">
                    Low Stock Limit
                  </h2>

                  <p className="mt-1 text-sm text-[#746D5E]">
                    Configure the stock warning threshold.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={updatingLimit}
                  onClick={() => {
                    setShowLimitModal(false);
                    setError("");
                  }}
                  aria-label="Close low-stock limit modal"
                  className="rounded-lg p-2 text-[#918875] transition-colors hover:bg-[#F4F0E6] hover:text-[#171914] disabled:opacity-50"
                >
                  <X size={19} />
                </button>
              </div>

              <form onSubmit={handleLimitUpdate} className="space-y-5 p-5">
                <div className="rounded-xl border border-[#E6D9BD] bg-[#F4F0E6] p-4">
                  <p className="text-sm text-[#746D5E]">
                    Product
                  </p>

                  <p className="mt-1 font-semibold text-[#171914]">
                    {selectedItem.product?.brand}{" "}
                    {selectedItem.product?.model}
                  </p>

                  <p className="mt-2 text-sm text-[#746D5E]">
                    Current stock:{" "}
                    <span className="font-bold text-[#171914]">
                      {formatNumber(selectedItem.quantity)}
                    </span>
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="low-stock-limit"
                    className="mb-2 block text-sm font-semibold text-[#514B3E]"
                  >
                    Alert when stock reaches *
                  </label>

                  <input
                    id="low-stock-limit"
                    type="number"
                    min="0"
                    step="1"
                    value={limitValue}
                    onChange={(event) =>
                      setLimitValue(event.target.value)
                    }
                    placeholder="Enter minimum stock"
                    className={inputClass}
                    required
                  />

                  <p className="mt-2 text-xs text-[#918875]">
                    A low-stock warning appears when the quantity is
                    at or below this limit.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={updatingLimit}
                    onClick={() => {
                      setShowLimitModal(false);
                      setError("");
                    }}
                    className="rounded-xl border border-[#E6D9BD] px-5 py-3 text-sm font-semibold text-[#514B3E] transition-colors hover:bg-[#F4F0E6] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <motion.button
                    type="submit"
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={updatingLimit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FFE18A] to-[#E9B83F] px-5 py-3 text-sm font-bold text-[#171914] transition-shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingLimit && (
                      <Loader2 size={17} className="animate-spin" />
                    )}

                    {updatingLimit
                      ? "Saving..."
                      : "Save Limit"}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Inventory;