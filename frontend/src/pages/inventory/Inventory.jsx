import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Plus,
  Minus,
  X,
  Loader2,
  Smartphone,
  ShieldAlert,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import Sidebar from "../../components/layout/Sidebar";

import {
  getInventory,
  addStock,
  removeStock,
  updateLowStockLimit,
} from "../../services/inventoryService";

/* =====================================================
   STOCK STATUS
===================================================== */

const getStockStatus = (quantity, lowStockLimit) => {
  const stock = Number(quantity || 0);
  const limit = Number(lowStockLimit || 0);

  if (stock === 0) {
    return {
      label: "Out of Stock",
      className: "bg-red-50 text-red-600 border-red-200",
      dot: "bg-red-500",
    };
  }

  if (stock <= limit) {
    return {
      label: "Low Stock",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      dot: "bg-amber-500",
    };
  }

  return {
    label: "In Stock",
    className: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-500",
  };
};

/* =====================================================
   FORMAT NUMBER
===================================================== */

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};

/* =====================================================
   INVENTORY
===================================================== */

function Inventory() {
  /* =====================================================
     USER
  ===================================================== */

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";

  /* =====================================================
     DATA
  ===================================================== */

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =====================================================
     SEARCH + FILTER
  ===================================================== */

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* =====================================================
     ALERTS
  ===================================================== */

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* =====================================================
     STOCK MODAL
  ===================================================== */

  const [showStockModal, setShowStockModal] =
    useState(false);

  const [stockAction, setStockAction] =
    useState("ADD");

  const [selectedItem, setSelectedItem] =
    useState(null);

  const [stockQuantity, setStockQuantity] =
    useState("");

  const [updatingStock, setUpdatingStock] =
    useState(false);

  /* =====================================================
     LOW STOCK LIMIT MODAL
  ===================================================== */

  const [showLimitModal, setShowLimitModal] =
    useState(false);

  const [limitValue, setLimitValue] =
    useState("");

  const [updatingLimit, setUpdatingLimit] =
    useState(false);

  /* =====================================================
     LOAD INVENTORY
  ===================================================== */

  const loadInventory = async (refresh = false) => {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getInventory();

      if (data.success) {
        setInventory(data.inventory || []);
      } else {
        setError(
          data.message || "Failed to load inventory."
        );
      }
    } catch (err) {
      console.error("Inventory Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load inventory."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    loadInventory();
  }, []);

  /* =====================================================
     FILTER INVENTORY
  ===================================================== */

  const filteredInventory = useMemo(() => {
    const query = search.trim().toLowerCase();

    return inventory.filter((item) => {
      const product = item.product;

      if (!product) {
        return false;
      }

      const matchesSearch =
        !query ||
        product.brand
          ?.toLowerCase()
          .includes(query) ||
        product.model
          ?.toLowerCase()
          .includes(query) ||
        product.barcode
          ?.toLowerCase()
          .includes(query) ||
        product.category
          ?.toLowerCase()
          .includes(query);

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
  }, [
    inventory,
    search,
    statusFilter,
  ]);

  /* =====================================================
     STATS
  ===================================================== */

  const totalProducts = inventory.length;

  const totalStock = inventory.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const lowStockCount = inventory.filter(
    (item) =>
      Number(item.quantity || 0) > 0 &&
      Number(item.quantity || 0) <=
        Number(item.lowStockLimit || 0)
  ).length;

  const outOfStockCount = inventory.filter(
    (item) =>
      Number(item.quantity || 0) === 0
  ).length;

  /* =====================================================
     OPEN ADD STOCK
  ===================================================== */

  const openAddStock = (item) => {
    setSelectedItem(item);
    setStockAction("ADD");
    setStockQuantity("");
    setError("");
    setSuccess("");
    setShowStockModal(true);
  };

  /* =====================================================
     OPEN REMOVE STOCK
  ===================================================== */

  const openRemoveStock = (item) => {
    setSelectedItem(item);
    setStockAction("REMOVE");
    setStockQuantity("");
    setError("");
    setSuccess("");
    setShowStockModal(true);
  };

  /* =====================================================
     UPDATE STOCK
  ===================================================== */

  const handleStockUpdate = async (e) => {
    e.preventDefault();

    if (!selectedItem) return;

    const quantity = Number(stockQuantity);

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      setError(
        "Please enter a valid positive quantity."
      );
      return;
    }

    if (
      stockAction === "REMOVE" &&
      quantity >
        Number(selectedItem.quantity || 0)
    ) {
      setError(
        "You cannot remove more stock than available."
      );
      return;
    }

    try {
      setUpdatingStock(true);
      setError("");
      setSuccess("");

      const productId =
        selectedItem.product._id;

      let data;

      if (stockAction === "ADD") {
        data = await addStock(
          productId,
          quantity
        );
      } else {
        data = await removeStock(
          productId,
          quantity
        );
      }

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to update stock."
        );
      }

      setShowStockModal(false);

      setSuccess(
        data.message ||
          "Stock updated successfully."
      );

      await loadInventory(true);

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Stock Update Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update stock."
      );
    } finally {
      setUpdatingStock(false);
    }
  };

  /* =====================================================
     OPEN LOW STOCK LIMIT
  ===================================================== */

  const openLimitModal = (item) => {
    setSelectedItem(item);

    setLimitValue(
      item.lowStockLimit ?? 5
    );

    setError("");
    setShowLimitModal(true);
  };

  /* =====================================================
     UPDATE LOW STOCK LIMIT
  ===================================================== */

  const handleLimitUpdate = async (e) => {
    e.preventDefault();

    if (!selectedItem) return;

    const limit = Number(limitValue);

    if (
      !Number.isInteger(limit) ||
      limit < 0
    ) {
      setError(
        "Low stock limit must be a valid number."
      );
      return;
    }

    try {
      setUpdatingLimit(true);
      setError("");

      const productId =
        selectedItem.product._id;

      const data =
        await updateLowStockLimit(
          productId,
          limit
        );

      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to update low stock limit."
        );
      }

      setShowLimitModal(false);

      setSuccess(
        "Low stock limit updated successfully."
      );

      await loadInventory(true);

      setTimeout(() => {
        setSuccess("");
      }, 2500);
    } catch (err) {
      console.error(
        "Low Stock Limit Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update low stock limit."
      );
    } finally {
      setUpdatingLimit(false);
    }
  };

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <Sidebar />

        <main className="ml-[250px] min-h-screen p-6">
          <div className="space-y-6">
            <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white"
                />
              ))}
            </div>

            <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
          </div>
        </main>
      </div>
    );
  }

  /* =====================================================
     MAIN UI
  ===================================================== */

  return (
    <div className="min-h-screen bg-[#F8F9FA]">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="ml-[250px] min-h-screen p-6">

        <div className="space-y-6">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <div className="flex items-center gap-3">

                {/* <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-[#F4C64E] shadow-sm">
                  <Boxes size={24} />
                </div> */}

                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950">
                    Inventory
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage your shop stock and inventory
                  </p>
                </div>

              </div>
            </div>

            {/* REFRESH */}

            <button
              onClick={() =>
                loadInventory(true)
              }
              disabled={refreshing}
              className="
                flex
                h-11
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-white
                px-4
                text-sm
                font-semibold
                text-slate-600
                shadow-sm
                transition-all
                duration-300
                hover:-translate-y-1
                hover:border-[#F4C64E]
                hover:text-slate-950
                hover:shadow-md
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={17}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

          </div>

          {/* =================================================
              ALERTS
          ================================================= */}

          <AnimatePresence>

            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "
              >
                <AlertTriangle size={18} />

                <span>{error}</span>

                <button
                  onClick={() =>
                    setError("")
                  }
                  className="ml-auto"
                >
                  <X size={17} />
                </button>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  y: -10,
                }}
                className="
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-4
                  py-3
                  text-sm
                  text-emerald-600
                "
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
                  ✓
                </span>

                {success}
              </motion.div>
            )}

          </AnimatePresence>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Products"
              value={formatNumber(
                totalProducts
              )}
              icon={Package}
              iconClass="bg-blue-50 text-blue-600"
              description="Products in inventory"
            />

            <StatCard
              title="Total Stock"
              value={formatNumber(
                totalStock
              )}
              icon={Boxes}
              iconClass="bg-emerald-50 text-emerald-600"
              description="Available units"
            />

            <StatCard
              title="Low Stock"
              value={formatNumber(
                lowStockCount
              )}
              icon={AlertTriangle}
              iconClass="bg-amber-50 text-amber-600"
              description="Need attention"
            />

            <StatCard
              title="Out of Stock"
              value={formatNumber(
                outOfStockCount
              )}
              icon={XCircle}
              iconClass="bg-red-50 text-red-500"
              description="Currently unavailable"
            />

          </div>

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-3 lg:flex-row">

              {/* SEARCH */}

              <div className="relative flex-1">

                <Search
                  size={19}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-slate-400
                  "
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search by brand, model or barcode..."
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    pl-11
                    pr-4
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    focus:border-[#F4C64E]
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#F4C64E]/10
                  "
                />

              </div>

              {/* STATUS */}

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="
                  h-12
                  rounded-xl
                  border
                  border-slate-200
                  bg-slate-50
                  px-4
                  text-sm
                  text-slate-700
                  outline-none
                  transition
                  focus:border-[#F4C64E]
                  focus:ring-4
                  focus:ring-[#F4C64E]/10
                "
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="IN_STOCK">
                  In Stock
                </option>

                <option value="LOW_STOCK">
                  Low Stock
                </option>

                <option value="OUT_OF_STOCK">
                  Out of Stock
                </option>
              </select>

            </div>
          </div>

          {/* =================================================
              INVENTORY TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            {filteredInventory.length === 0 ? (

              <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">

                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Boxes size={30} />
                </div>

                <h3 className="text-lg font-bold text-slate-950">
                  No inventory found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {search
                    ? "Try another search term."
                    : "There are no inventory records available."}
                </p>

              </div>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1050px]">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Product
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Category
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Stock
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                        Low Limit
                      </th>

                      <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredInventory.map(
                      (item) => {
                        const product =
                          item.product;

                        const status =
                          getStockStatus(
                            item.quantity,
                            item.lowStockLimit
                          );

                        return (
                          <motion.tr
                            key={item._id}
                            initial={{
                              opacity: 0,
                            }}
                            animate={{
                              opacity: 1,
                            }}
                            className="
                              group
                              transition-colors
                              hover:bg-slate-50/80
                            "
                          >

                            {/* PRODUCT */}

                            <td className="px-6 py-5">

                              <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">

                                  {product.image ? (
                                    <img
                                      src={
                                        product.image
                                      }
                                      alt={`${product.brand} ${product.model}`}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <Smartphone
                                      size={20}
                                      className="text-slate-400"
                                    />
                                  )}

                                </div>

                                <div className="min-w-0">

                                  <p className="truncate text-sm font-bold text-slate-950">
                                    {product.brand}{" "}
                                    {product.model}
                                  </p>

                                  <p className="mt-1 truncate text-xs text-slate-500">
                                    {product.barcode ||
                                      "No barcode"}
                                  </p>

                                </div>

                              </div>

                            </td>

                            {/* CATEGORY */}

                            <td className="px-6 py-5">

                              <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                {product.category}
                              </span>

                            </td>

                            {/* STOCK */}

                            <td className="px-6 py-5">

                              <div>
                                <p className="text-lg font-bold text-slate-950">
                                  {formatNumber(
                                    item.quantity
                                  )}
                                </p>

                                <p className="text-xs text-slate-400">
                                  units
                                </p>
                              </div>

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-5">

                              <span
                                className={`
                                  inline-flex
                                  items-center
                                  gap-2
                                  rounded-full
                                  border
                                  px-3
                                  py-1.5
                                  text-xs
                                  font-semibold
                                  ${status.className}
                                `}
                              >

                                <span
                                  className={`
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    ${status.dot}
                                  `}
                                />

                                {status.label}

                              </span>

                            </td>

                            {/* LIMIT */}

                            <td className="px-6 py-5">

                              <span className="text-sm font-semibold text-slate-700">
                                {item.lowStockLimit}
                              </span>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-5">

                              <div className="flex justify-end gap-2">

                                {isAdmin && (
                                  <>
                                    <ActionButton
                                      icon={
                                        <Plus size={16} />
                                      }
                                      label="Add"
                                      onClick={() =>
                                        openAddStock(
                                          item
                                        )
                                      }
                                    />

                                    <ActionButton
                                      icon={
                                        <Minus size={16} />
                                      }
                                      label="Remove"
                                      onClick={() =>
                                        openRemoveStock(
                                          item
                                        )
                                      }
                                    />

                                    <ActionButton
                                      icon={
                                        <ShieldAlert
                                          size={16}
                                        />
                                      }
                                      label="Limit"
                                      onClick={() =>
                                        openLimitModal(
                                          item
                                        )
                                      }
                                    />
                                  </>
                                )}

                              </div>

                            </td>

                          </motion.tr>
                        );
                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>
      </main>

      {/* =================================================
          STOCK MODAL
      ================================================= */}

      <AnimatePresence>

        {showStockModal &&
          selectedItem && (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-950/50
                p-4
                backdrop-blur-sm
              "
            >

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      {stockAction === "ADD"
                        ? "Add Stock"
                        : "Remove Stock"}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedItem.product.brand}{" "}
                      {selectedItem.product.model}
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowStockModal(false)
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    <X size={18} />
                  </button>

                </div>

                <div className="mt-6 rounded-xl bg-slate-50 p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm text-slate-500">
                      Current Stock
                    </span>

                    <span className="text-lg font-bold text-slate-950">
                      {selectedItem.quantity}
                    </span>

                  </div>

                </div>

                <form
                  onSubmit={handleStockUpdate}
                  className="mt-5"
                >

                  <label className="text-sm font-semibold text-slate-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={stockQuantity}
                    onChange={(e) =>
                      setStockQuantity(
                        e.target.value
                      )
                    }
                    placeholder="Enter quantity"
                    autoFocus
                    className="
                      mt-2
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      text-sm
                      outline-none
                      transition
                      focus:border-[#F4C64E]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#F4C64E]/10
                    "
                  />

                  {error && (
                    <p className="mt-2 text-xs text-red-500">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setShowStockModal(false)
                      }
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-slate-600
                        transition
                        hover:bg-slate-50
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={updatingStock}
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-slate-950
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        transition
                        hover:bg-slate-800
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {updatingStock ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
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

                    </button>

                  </div>

                </form>

              </motion.div>

            </motion.div>

          )}

      </AnimatePresence>

      {/* =================================================
          LOW STOCK LIMIT MODAL
      ================================================= */}

      <AnimatePresence>

        {showLimitModal &&
          selectedItem && (

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-slate-950/50
                p-4
                backdrop-blur-sm
              "
            >

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: 20,
                }}
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
              >

                <div className="flex items-start justify-between">

                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      Low Stock Limit
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Set the alert level for this product.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setShowLimitModal(false)
                    }
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
                  >
                    <X size={18} />
                  </button>

                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">

                  <p className="text-sm font-bold text-slate-900">
                    {selectedItem.product.brand}{" "}
                    {selectedItem.product.model}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current stock:{" "}
                    {selectedItem.quantity}
                  </p>

                </div>

                <form
                  onSubmit={handleLimitUpdate}
                  className="mt-5"
                >

                  <label className="text-sm font-semibold text-slate-700">
                    Low Stock Limit
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={limitValue}
                    onChange={(e) =>
                      setLimitValue(
                        e.target.value
                      )
                    }
                    className="
                      mt-2
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-4
                      text-sm
                      outline-none
                      transition
                      focus:border-[#F4C64E]
                      focus:bg-white
                      focus:ring-4
                      focus:ring-[#F4C64E]/10
                    "
                  />

                  {error && (
                    <p className="mt-2 text-xs text-red-500">
                      {error}
                    </p>
                  )}

                  <div className="mt-6 flex gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        setShowLimitModal(false)
                      }
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-slate-200
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-slate-600
                        transition
                        hover:bg-slate-50
                      "
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={updatingLimit}
                      className="
                        flex
                        flex-1
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-slate-950
                        px-4
                        py-3
                        text-sm
                        font-bold
                        text-white
                        transition
                        hover:bg-slate-800
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {updatingLimit && (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      )}

                      {updatingLimit
                        ? "Saving..."
                        : "Save Limit"}

                    </button>

                  </div>

                </form>

              </motion.div>

            </motion.div>

          )}

      </AnimatePresence>

    </div>
  );
}

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
  description,
}) {
  return (
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

        </div>

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            ${iconClass}
            transition-transform
            duration-300
            group-hover:scale-110
          `}
        >
          <Icon size={20} />
        </div>

      </div>

      <p className="mt-4 text-xs text-slate-400">
        {description}
      </p>

    </div>
  );
}

/* =====================================================
   ACTION BUTTON
===================================================== */

function ActionButton({
  icon,
  label,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="
        flex
        h-9
        items-center
        gap-1.5
        rounded-lg
        border
        border-slate-200
        bg-white
        px-2.5
        text-xs
        font-semibold
        text-slate-600
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-[#F4C64E]
        hover:bg-[#FFF9E8]
        hover:text-slate-950
      "
    >
      {icon}

      <span className="hidden xl:inline">
        {label}
      </span>
    </button>
  );
}

export default Inventory;