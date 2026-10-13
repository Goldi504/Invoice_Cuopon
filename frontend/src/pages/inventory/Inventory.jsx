// import React, {
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   Package,
//   Boxes,
//   AlertTriangle,
//   XCircle,
//   Search,
//   RefreshCw,
//   Plus,
//   Minus,
//   X,
//   Loader2,
//   Smartphone,
//   ShieldAlert,
// } from "lucide-react";

// import { motion, AnimatePresence } from "framer-motion";

// import Sidebar from "../../components/layout/Sidebar";

// import {
//   getInventory,
//   addStock,
//   removeStock,
//   updateLowStockLimit,
// } from "../../services/inventoryService";

// /* =====================================================
//    STOCK STATUS
// ===================================================== */

// const getStockStatus = (quantity, lowStockLimit) => {
//   const stock = Number(quantity || 0);
//   const limit = Number(lowStockLimit || 0);

//   if (stock === 0) {
//     return {
//       label: "Out of Stock",
//       className: "bg-red-50 text-red-600 border-red-200",
//       dot: "bg-red-500",
//     };
//   }

//   if (stock <= limit) {
//     return {
//       label: "Low Stock",
//       className: "bg-amber-50 text-amber-700 border-amber-200",
//       dot: "bg-amber-500",
//     };
//   }

//   return {
//     label: "In Stock",
//     className: "bg-emerald-50 text-emerald-600 border-emerald-200",
//     dot: "bg-emerald-500",
//   };
// };

// /* =====================================================
//    FORMAT NUMBER
// ===================================================== */

// const formatNumber = (value) => {
//   return Number(value || 0).toLocaleString("en-IN");
// };

// /* =====================================================
//    INVENTORY
// ===================================================== */

// function Inventory() {
//   /* =====================================================
//      USER
//   ===================================================== */

//   const user = JSON.parse(
//     localStorage.getItem("user") || "null"
//   );

//   const isAdmin = user?.role === "ADMIN";

//   /* =====================================================
//      DATA
//   ===================================================== */

//   const [inventory, setInventory] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

//   /* =====================================================
//      SEARCH + FILTER
//   ===================================================== */

//   const [search, setSearch] = useState("");
//   const [statusFilter, setStatusFilter] = useState("ALL");

//   /* =====================================================
//      ALERTS
//   ===================================================== */

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   /* =====================================================
//      STOCK MODAL
//   ===================================================== */

//   const [showStockModal, setShowStockModal] =
//     useState(false);

//   const [stockAction, setStockAction] =
//     useState("ADD");

//   const [selectedItem, setSelectedItem] =
//     useState(null);

//   const [stockQuantity, setStockQuantity] =
//     useState("");

//   const [updatingStock, setUpdatingStock] =
//     useState(false);

//   /* =====================================================
//      LOW STOCK LIMIT MODAL
//   ===================================================== */

//   const [showLimitModal, setShowLimitModal] =
//     useState(false);

//   const [limitValue, setLimitValue] =
//     useState("");

//   const [updatingLimit, setUpdatingLimit] =
//     useState(false);

//   /* =====================================================
//      LOAD INVENTORY
//   ===================================================== */

//   const loadInventory = async (refresh = false) => {
//     try {
//       setError("");

//       if (refresh) {
//         setRefreshing(true);
//       } else {
//         setLoading(true);
//       }

//       const data = await getInventory();

//       if (data.success) {
//         setInventory(data.inventory || []);
//       } else {
//         setError(
//           data.message || "Failed to load inventory."
//         );
//       }
//     } catch (err) {
//       console.error("Inventory Error:", err);

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to load inventory."
//       );
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   /* =====================================================
//      INITIAL LOAD
//   ===================================================== */

//   useEffect(() => {
//     loadInventory();
//   }, []);

//   /* =====================================================
//      FILTER INVENTORY
//   ===================================================== */

//   const filteredInventory = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return inventory.filter((item) => {
//       const product = item.product;

//       if (!product) {
//         return false;
//       }

//       const matchesSearch =
//         !query ||
//         product.brand
//           ?.toLowerCase()
//           .includes(query) ||
//         product.model
//           ?.toLowerCase()
//           .includes(query) ||
//         product.barcode
//           ?.toLowerCase()
//           .includes(query) ||
//         product.category
//           ?.toLowerCase()
//           .includes(query);

//       const status = getStockStatus(
//         item.quantity,
//         item.lowStockLimit
//       );

//       const matchesStatus =
//         statusFilter === "ALL" ||
//         (statusFilter === "IN_STOCK" &&
//           status.label === "In Stock") ||
//         (statusFilter === "LOW_STOCK" &&
//           status.label === "Low Stock") ||
//         (statusFilter === "OUT_OF_STOCK" &&
//           status.label === "Out of Stock");

//       return matchesSearch && matchesStatus;
//     });
//   }, [
//     inventory,
//     search,
//     statusFilter,
//   ]);

//   /* =====================================================
//      STATS
//   ===================================================== */

//   const totalProducts = inventory.length;

//   const totalStock = inventory.reduce(
//     (sum, item) =>
//       sum + Number(item.quantity || 0),
//     0
//   );

//   const lowStockCount = inventory.filter(
//     (item) =>
//       Number(item.quantity || 0) > 0 &&
//       Number(item.quantity || 0) <=
//         Number(item.lowStockLimit || 0)
//   ).length;

//   const outOfStockCount = inventory.filter(
//     (item) =>
//       Number(item.quantity || 0) === 0
//   ).length;

//   /* =====================================================
//      OPEN ADD STOCK
//   ===================================================== */

//   const openAddStock = (item) => {
//     setSelectedItem(item);
//     setStockAction("ADD");
//     setStockQuantity("");
//     setError("");
//     setSuccess("");
//     setShowStockModal(true);
//   };

//   /* =====================================================
//      OPEN REMOVE STOCK
//   ===================================================== */

//   const openRemoveStock = (item) => {
//     setSelectedItem(item);
//     setStockAction("REMOVE");
//     setStockQuantity("");
//     setError("");
//     setSuccess("");
//     setShowStockModal(true);
//   };

//   /* =====================================================
//      UPDATE STOCK
//   ===================================================== */

//   const handleStockUpdate = async (e) => {
//     e.preventDefault();

//     if (!selectedItem) return;

//     const quantity = Number(stockQuantity);

//     if (
//       !Number.isInteger(quantity) ||
//       quantity <= 0
//     ) {
//       setError(
//         "Please enter a valid positive quantity."
//       );
//       return;
//     }

//     if (
//       stockAction === "REMOVE" &&
//       quantity >
//         Number(selectedItem.quantity || 0)
//     ) {
//       setError(
//         "You cannot remove more stock than available."
//       );
//       return;
//     }

//     try {
//       setUpdatingStock(true);
//       setError("");
//       setSuccess("");

//       const productId =
//         selectedItem.product._id;

//       let data;

//       if (stockAction === "ADD") {
//         data = await addStock(
//           productId,
//           quantity
//         );
//       } else {
//         data = await removeStock(
//           productId,
//           quantity
//         );
//       }

//       if (!data.success) {
//         throw new Error(
//           data.message ||
//             "Failed to update stock."
//         );
//       }

//       setShowStockModal(false);

//       setSuccess(
//         data.message ||
//           "Stock updated successfully."
//       );

//       await loadInventory(true);

//       setTimeout(() => {
//         setSuccess("");
//       }, 2500);
//     } catch (err) {
//       console.error(
//         "Stock Update Error:",
//         err
//       );

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to update stock."
//       );
//     } finally {
//       setUpdatingStock(false);
//     }
//   };

//   /* =====================================================
//      OPEN LOW STOCK LIMIT
//   ===================================================== */

//   const openLimitModal = (item) => {
//     setSelectedItem(item);

//     setLimitValue(
//       item.lowStockLimit ?? 5
//     );

//     setError("");
//     setShowLimitModal(true);
//   };

//   /* =====================================================
//      UPDATE LOW STOCK LIMIT
//   ===================================================== */

//   const handleLimitUpdate = async (e) => {
//     e.preventDefault();

//     if (!selectedItem) return;

//     const limit = Number(limitValue);

//     if (
//       !Number.isInteger(limit) ||
//       limit < 0
//     ) {
//       setError(
//         "Low stock limit must be a valid number."
//       );
//       return;
//     }

//     try {
//       setUpdatingLimit(true);
//       setError("");

//       const productId =
//         selectedItem.product._id;

//       const data =
//         await updateLowStockLimit(
//           productId,
//           limit
//         );

//       if (!data.success) {
//         throw new Error(
//           data.message ||
//             "Failed to update low stock limit."
//         );
//       }

//       setShowLimitModal(false);

//       setSuccess(
//         "Low stock limit updated successfully."
//       );

//       await loadInventory(true);

//       setTimeout(() => {
//         setSuccess("");
//       }, 2500);
//     } catch (err) {
//       console.error(
//         "Low Stock Limit Error:",
//         err
//       );

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to update low stock limit."
//       );
//     } finally {
//       setUpdatingLimit(false);
//     }
//   };

//   /* =====================================================
//      LOADING
//   ===================================================== */

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#F8F9FA]">
//         <Sidebar />

//         <main className="ml-[250px] min-h-screen p-6">
//           <div className="space-y-6">
//             <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
//               {[1, 2, 3, 4].map((item) => (
//                 <div
//                   key={item}
//                   className="h-32 animate-pulse rounded-2xl bg-white"
//                 />
//               ))}
//             </div>

//             <div className="h-[500px] animate-pulse rounded-2xl bg-white" />
//           </div>
//         </main>
//       </div>
//     );
//   }

//   /* =====================================================
//      MAIN UI
//   ===================================================== */

//   return (
//     <div className="min-h-screen bg-[#F8F9FA]">

//       {/* =================================================
//           SIDEBAR
//       ================================================= */}

//       <Sidebar />

//       {/* =================================================
//           MAIN CONTENT
//       ================================================= */}

//       <main className="ml-[250px] min-h-screen p-6">

//         <div className="space-y-6">

//           {/* =================================================
//               HEADER
//           ================================================= */}

//           <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

//             <div>
//               <div className="flex items-center gap-3">

//                 {/* <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-[#F4C64E] shadow-sm">
//                   <Boxes size={24} />
//                 </div> */}

//                 <div>
//                   <h1 className="text-3xl font-bold tracking-tight text-slate-950">
//                     Inventory
//                   </h1>

//                   <p className="mt-1 text-sm text-slate-500">
//                     Manage your shop stock and inventory
//                   </p>
//                 </div>

//               </div>
//             </div>

//             {/* REFRESH */}

//             <button
//               onClick={() =>
//                 loadInventory(true)
//               }
//               disabled={refreshing}
//               className="
//                 flex
//                 h-11
//                 items-center
//                 justify-center
//                 gap-2
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-white
//                 px-4
//                 text-sm
//                 font-semibold
//                 text-slate-600
//                 shadow-sm
//                 transition-all
//                 duration-300
//                 hover:-translate-y-1
//                 hover:border-[#F4C64E]
//                 hover:text-slate-950
//                 hover:shadow-md
//                 disabled:cursor-not-allowed
//                 disabled:opacity-60
//               "
//             >
//               <RefreshCw
//                 size={17}
//                 className={
//                   refreshing
//                     ? "animate-spin"
//                     : ""
//                 }
//               />

//               Refresh
//             </button>

//           </div>

//           {/* =================================================
//               ALERTS
//           ================================================= */}

//           <AnimatePresence>

//             {error && (
//               <motion.div
//                 initial={{
//                   opacity: 0,
//                   y: -10,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   y: -10,
//                 }}
//                 className="
//                   flex
//                   items-center
//                   gap-3
//                   rounded-xl
//                   border
//                   border-red-200
//                   bg-red-50
//                   px-4
//                   py-3
//                   text-sm
//                   text-red-600
//                 "
//               >
//                 <AlertTriangle size={18} />

//                 <span>{error}</span>

//                 <button
//                   onClick={() =>
//                     setError("")
//                   }
//                   className="ml-auto"
//                 >
//                   <X size={17} />
//                 </button>
//               </motion.div>
//             )}

//             {success && (
//               <motion.div
//                 initial={{
//                   opacity: 0,
//                   y: -10,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   y: 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   y: -10,
//                 }}
//                 className="
//                   flex
//                   items-center
//                   gap-3
//                   rounded-xl
//                   border
//                   border-emerald-200
//                   bg-emerald-50
//                   px-4
//                   py-3
//                   text-sm
//                   text-emerald-600
//                 "
//               >
//                 <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
//                   ✓
//                 </span>

//                 {success}
//               </motion.div>
//             )}

//           </AnimatePresence>

//           {/* =================================================
//               STAT CARDS
//           ================================================= */}

//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

//             <StatCard
//               title="Products"
//               value={formatNumber(
//                 totalProducts
//               )}
//               icon={Package}
//               iconClass="bg-blue-50 text-blue-600"
//               description="Products in inventory"
//             />

//             <StatCard
//               title="Total Stock"
//               value={formatNumber(
//                 totalStock
//               )}
//               icon={Boxes}
//               iconClass="bg-emerald-50 text-emerald-600"
//               description="Available units"
//             />

//             <StatCard
//               title="Low Stock"
//               value={formatNumber(
//                 lowStockCount
//               )}
//               icon={AlertTriangle}
//               iconClass="bg-amber-50 text-amber-600"
//               description="Need attention"
//             />

//             <StatCard
//               title="Out of Stock"
//               value={formatNumber(
//                 outOfStockCount
//               )}
//               icon={XCircle}
//               iconClass="bg-red-50 text-red-500"
//               description="Currently unavailable"
//             />

//           </div>

//           {/* =================================================
//               TOOLBAR
//           ================================================= */}

//           <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

//             <div className="flex flex-col gap-3 lg:flex-row">

//               {/* SEARCH */}

//               <div className="relative flex-1">

//                 <Search
//                   size={19}
//                   className="
//                     absolute
//                     left-4
//                     top-1/2
//                     -translate-y-1/2
//                     text-slate-400
//                   "
//                 />

//                 <input
//                   value={search}
//                   onChange={(e) =>
//                     setSearch(e.target.value)
//                   }
//                   placeholder="Search by brand, model or barcode..."
//                   className="
//                     h-12
//                     w-full
//                     rounded-xl
//                     border
//                     border-slate-200
//                     bg-slate-50
//                     pl-11
//                     pr-4
//                     text-sm
//                     text-slate-700
//                     outline-none
//                     transition
//                     focus:border-[#F4C64E]
//                     focus:bg-white
//                     focus:ring-4
//                     focus:ring-[#F4C64E]/10
//                   "
//                 />

//               </div>

//               {/* STATUS */}

//               <select
//                 value={statusFilter}
//                 onChange={(e) =>
//                   setStatusFilter(
//                     e.target.value
//                   )
//                 }
//                 className="
//                   h-12
//                   rounded-xl
//                   border
//                   border-slate-200
//                   bg-slate-50
//                   px-4
//                   text-sm
//                   text-slate-700
//                   outline-none
//                   transition
//                   focus:border-[#F4C64E]
//                   focus:ring-4
//                   focus:ring-[#F4C64E]/10
//                 "
//               >
//                 <option value="ALL">
//                   All Status
//                 </option>

//                 <option value="IN_STOCK">
//                   In Stock
//                 </option>

//                 <option value="LOW_STOCK">
//                   Low Stock
//                 </option>

//                 <option value="OUT_OF_STOCK">
//                   Out of Stock
//                 </option>
//               </select>

//             </div>
//           </div>

//           {/* =================================================
//               INVENTORY TABLE
//           ================================================= */}

//           <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

//             {filteredInventory.length === 0 ? (

//               <div className="flex min-h-[400px] flex-col items-center justify-center px-6 text-center">

//                 <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
//                   <Boxes size={30} />
//                 </div>

//                 <h3 className="text-lg font-bold text-slate-950">
//                   No inventory found
//                 </h3>

//                 <p className="mt-1 max-w-sm text-sm text-slate-500">
//                   {search
//                     ? "Try another search term."
//                     : "There are no inventory records available."}
//                 </p>

//               </div>

//             ) : (

//               <div className="overflow-x-auto">

//                 <table className="w-full min-w-[1050px]">

//                   <thead>
//                     <tr className="border-b border-slate-200 bg-slate-50">

//                       <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                         Product
//                       </th>

//                       <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                         Category
//                       </th>

//                       <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                         Stock
//                       </th>

//                       <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                         Status
//                       </th>

//                       <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                         Low Limit
//                       </th>

//                       <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
//                         Actions
//                       </th>

//                     </tr>
//                   </thead>

//                   <tbody className="divide-y divide-slate-100">

//                     {filteredInventory.map(
//                       (item) => {
//                         const product =
//                           item.product;

//                         const status =
//                           getStockStatus(
//                             item.quantity,
//                             item.lowStockLimit
//                           );

//                         return (
//                           <motion.tr
//                             key={item._id}
//                             initial={{
//                               opacity: 0,
//                             }}
//                             animate={{
//                               opacity: 1,
//                             }}
//                             className="
//                               group
//                               transition-colors
//                               hover:bg-slate-50/80
//                             "
//                           >

//                             {/* PRODUCT */}

//                             <td className="px-6 py-5">

//                               <div className="flex items-center gap-3">

//                                 <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">

//                                   {product.image ? (
//                                     <img
//                                       src={
//                                         product.image
//                                       }
//                                       alt={`${product.brand} ${product.model}`}
//                                       className="h-full w-full object-cover"
//                                     />
//                                   ) : (
//                                     <Smartphone
//                                       size={20}
//                                       className="text-slate-400"
//                                     />
//                                   )}

//                                 </div>

//                                 <div className="min-w-0">

//                                   <p className="truncate text-sm font-bold text-slate-950">
//                                     {product.brand}{" "}
//                                     {product.model}
//                                   </p>

//                                   <p className="mt-1 truncate text-xs text-slate-500">
//                                     {product.barcode ||
//                                       "No barcode"}
//                                   </p>

//                                 </div>

//                               </div>

//                             </td>

//                             {/* CATEGORY */}

//                             <td className="px-6 py-5">

//                               <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
//                                 {product.category}
//                               </span>

//                             </td>

//                             {/* STOCK */}

//                             <td className="px-6 py-5">

//                               <div>
//                                 <p className="text-lg font-bold text-slate-950">
//                                   {formatNumber(
//                                     item.quantity
//                                   )}
//                                 </p>

//                                 <p className="text-xs text-slate-400">
//                                   units
//                                 </p>
//                               </div>

//                             </td>

//                             {/* STATUS */}

//                             <td className="px-6 py-5">

//                               <span
//                                 className={`
//                                   inline-flex
//                                   items-center
//                                   gap-2
//                                   rounded-full
//                                   border
//                                   px-3
//                                   py-1.5
//                                   text-xs
//                                   font-semibold
//                                   ${status.className}
//                                 `}
//                               >

//                                 <span
//                                   className={`
//                                     h-1.5
//                                     w-1.5
//                                     rounded-full
//                                     ${status.dot}
//                                   `}
//                                 />

//                                 {status.label}

//                               </span>

//                             </td>

//                             {/* LIMIT */}

//                             <td className="px-6 py-5">

//                               <span className="text-sm font-semibold text-slate-700">
//                                 {item.lowStockLimit}
//                               </span>

//                             </td>

//                             {/* ACTIONS */}

//                             <td className="px-6 py-5">

//                               <div className="flex justify-end gap-2">

//                                 {isAdmin && (
//                                   <>
//                                     <ActionButton
//                                       icon={
//                                         <Plus size={16} />
//                                       }
//                                       label="Add"
//                                       onClick={() =>
//                                         openAddStock(
//                                           item
//                                         )
//                                       }
//                                     />

//                                     <ActionButton
//                                       icon={
//                                         <Minus size={16} />
//                                       }
//                                       label="Remove"
//                                       onClick={() =>
//                                         openRemoveStock(
//                                           item
//                                         )
//                                       }
//                                     />

//                                     <ActionButton
//                                       icon={
//                                         <ShieldAlert
//                                           size={16}
//                                         />
//                                       }
//                                       label="Limit"
//                                       onClick={() =>
//                                         openLimitModal(
//                                           item
//                                         )
//                                       }
//                                     />
//                                   </>
//                                 )}

//                               </div>

//                             </td>

//                           </motion.tr>
//                         );
//                       }
//                     )}

//                   </tbody>

//                 </table>

//               </div>

//             )}

//           </div>

//         </div>
//       </main>

//       {/* =================================================
//           STOCK MODAL
//       ================================================= */}

//       <AnimatePresence>

//         {showStockModal &&
//           selectedItem && (

//             <motion.div
//               initial={{
//                 opacity: 0,
//               }}
//               animate={{
//                 opacity: 1,
//               }}
//               exit={{
//                 opacity: 0,
//               }}
//               className="
//                 fixed
//                 inset-0
//                 z-50
//                 flex
//                 items-center
//                 justify-center
//                 bg-slate-950/50
//                 p-4
//                 backdrop-blur-sm
//               "
//             >

//               <motion.div
//                 initial={{
//                   opacity: 0,
//                   scale: 0.95,
//                   y: 20,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   scale: 1,
//                   y: 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   scale: 0.95,
//                   y: 20,
//                 }}
//                 className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
//               >

//                 <div className="flex items-start justify-between">

//                   <div>
//                     <h2 className="text-xl font-bold text-slate-950">
//                       {stockAction === "ADD"
//                         ? "Add Stock"
//                         : "Remove Stock"}
//                     </h2>

//                     <p className="mt-1 text-sm text-slate-500">
//                       {selectedItem.product.brand}{" "}
//                       {selectedItem.product.model}
//                     </p>
//                   </div>

//                   <button
//                     onClick={() =>
//                       setShowStockModal(false)
//                     }
//                     className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
//                   >
//                     <X size={18} />
//                   </button>

//                 </div>

//                 <div className="mt-6 rounded-xl bg-slate-50 p-4">

//                   <div className="flex items-center justify-between">

//                     <span className="text-sm text-slate-500">
//                       Current Stock
//                     </span>

//                     <span className="text-lg font-bold text-slate-950">
//                       {selectedItem.quantity}
//                     </span>

//                   </div>

//                 </div>

//                 <form
//                   onSubmit={handleStockUpdate}
//                   className="mt-5"
//                 >

//                   <label className="text-sm font-semibold text-slate-700">
//                     Quantity
//                   </label>

//                   <input
//                     type="number"
//                     min="1"
//                     value={stockQuantity}
//                     onChange={(e) =>
//                       setStockQuantity(
//                         e.target.value
//                       )
//                     }
//                     placeholder="Enter quantity"
//                     autoFocus
//                     className="
//                       mt-2
//                       h-12
//                       w-full
//                       rounded-xl
//                       border
//                       border-slate-200
//                       bg-slate-50
//                       px-4
//                       text-sm
//                       outline-none
//                       transition
//                       focus:border-[#F4C64E]
//                       focus:bg-white
//                       focus:ring-4
//                       focus:ring-[#F4C64E]/10
//                     "
//                   />

//                   {error && (
//                     <p className="mt-2 text-xs text-red-500">
//                       {error}
//                     </p>
//                   )}

//                   <div className="mt-6 flex gap-3">

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowStockModal(false)
//                       }
//                       className="
//                         flex-1
//                         rounded-xl
//                         border
//                         border-slate-200
//                         px-4
//                         py-3
//                         text-sm
//                         font-semibold
//                         text-slate-600
//                         transition
//                         hover:bg-slate-50
//                       "
//                     >
//                       Cancel
//                     </button>

//                     <button
//                       type="submit"
//                       disabled={updatingStock}
//                       className="
//                         flex
//                         flex-1
//                         items-center
//                         justify-center
//                         gap-2
//                         rounded-xl
//                         bg-slate-950
//                         px-4
//                         py-3
//                         text-sm
//                         font-bold
//                         text-white
//                         transition
//                         hover:bg-slate-800
//                         disabled:cursor-not-allowed
//                         disabled:opacity-60
//                       "
//                     >

//                       {updatingStock ? (
//                         <Loader2
//                           size={17}
//                           className="animate-spin"
//                         />
//                       ) : stockAction === "ADD" ? (
//                         <Plus size={17} />
//                       ) : (
//                         <Minus size={17} />
//                       )}

//                       {updatingStock
//                         ? "Updating..."
//                         : stockAction === "ADD"
//                         ? "Add Stock"
//                         : "Remove Stock"}

//                     </button>

//                   </div>

//                 </form>

//               </motion.div>

//             </motion.div>

//           )}

//       </AnimatePresence>

//       {/* =================================================
//           LOW STOCK LIMIT MODAL
//       ================================================= */}

//       <AnimatePresence>

//         {showLimitModal &&
//           selectedItem && (

//             <motion.div
//               initial={{
//                 opacity: 0,
//               }}
//               animate={{
//                 opacity: 1,
//               }}
//               exit={{
//                 opacity: 0,
//               }}
//               className="
//                 fixed
//                 inset-0
//                 z-50
//                 flex
//                 items-center
//                 justify-center
//                 bg-slate-950/50
//                 p-4
//                 backdrop-blur-sm
//               "
//             >

//               <motion.div
//                 initial={{
//                   opacity: 0,
//                   scale: 0.95,
//                   y: 20,
//                 }}
//                 animate={{
//                   opacity: 1,
//                   scale: 1,
//                   y: 0,
//                 }}
//                 exit={{
//                   opacity: 0,
//                   scale: 0.95,
//                   y: 20,
//                 }}
//                 className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
//               >

//                 <div className="flex items-start justify-between">

//                   <div>
//                     <h2 className="text-xl font-bold text-slate-950">
//                       Low Stock Limit
//                     </h2>

//                     <p className="mt-1 text-sm text-slate-500">
//                       Set the alert level for this product.
//                     </p>
//                   </div>

//                   <button
//                     onClick={() =>
//                       setShowLimitModal(false)
//                     }
//                     className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100"
//                   >
//                     <X size={18} />
//                   </button>

//                 </div>

//                 <div className="mt-5 rounded-xl bg-slate-50 p-4">

//                   <p className="text-sm font-bold text-slate-900">
//                     {selectedItem.product.brand}{" "}
//                     {selectedItem.product.model}
//                   </p>

//                   <p className="mt-1 text-xs text-slate-500">
//                     Current stock:{" "}
//                     {selectedItem.quantity}
//                   </p>

//                 </div>

//                 <form
//                   onSubmit={handleLimitUpdate}
//                   className="mt-5"
//                 >

//                   <label className="text-sm font-semibold text-slate-700">
//                     Low Stock Limit
//                   </label>

//                   <input
//                     type="number"
//                     min="0"
//                     value={limitValue}
//                     onChange={(e) =>
//                       setLimitValue(
//                         e.target.value
//                       )
//                     }
//                     className="
//                       mt-2
//                       h-12
//                       w-full
//                       rounded-xl
//                       border
//                       border-slate-200
//                       bg-slate-50
//                       px-4
//                       text-sm
//                       outline-none
//                       transition
//                       focus:border-[#F4C64E]
//                       focus:bg-white
//                       focus:ring-4
//                       focus:ring-[#F4C64E]/10
//                     "
//                   />

//                   {error && (
//                     <p className="mt-2 text-xs text-red-500">
//                       {error}
//                     </p>
//                   )}

//                   <div className="mt-6 flex gap-3">

//                     <button
//                       type="button"
//                       onClick={() =>
//                         setShowLimitModal(false)
//                       }
//                       className="
//                         flex-1
//                         rounded-xl
//                         border
//                         border-slate-200
//                         px-4
//                         py-3
//                         text-sm
//                         font-semibold
//                         text-slate-600
//                         transition
//                         hover:bg-slate-50
//                       "
//                     >
//                       Cancel
//                     </button>

//                     <button
//                       type="submit"
//                       disabled={updatingLimit}
//                       className="
//                         flex
//                         flex-1
//                         items-center
//                         justify-center
//                         gap-2
//                         rounded-xl
//                         bg-slate-950
//                         px-4
//                         py-3
//                         text-sm
//                         font-bold
//                         text-white
//                         transition
//                         hover:bg-slate-800
//                         disabled:cursor-not-allowed
//                         disabled:opacity-60
//                       "
//                     >

//                       {updatingLimit && (
//                         <Loader2
//                           size={17}
//                           className="animate-spin"
//                         />
//                       )}

//                       {updatingLimit
//                         ? "Saving..."
//                         : "Save Limit"}

//                     </button>

//                   </div>

//                 </form>

//               </motion.div>

//             </motion.div>

//           )}

//       </AnimatePresence>

//     </div>
//   );
// }

// /* =====================================================
//    STAT CARD
// ===================================================== */

// function StatCard({
//   title,
//   value,
//   icon: Icon,
//   iconClass,
//   description,
// }) {
//   return (
//     <div
//       className="
//         group
//         rounded-2xl
//         border
//         border-slate-200
//         bg-white
//         p-5
//         shadow-sm
//         transition-all
//         duration-300
//         hover:-translate-y-1
//         hover:shadow-lg
//       "
//     >

//       <div className="flex items-start justify-between">

//         <div>

//           <p className="text-sm font-medium text-slate-500">
//             {title}
//           </p>

//           <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
//             {value}
//           </p>

//         </div>

//         <div
//           className={`
//             flex
//             h-11
//             w-11
//             items-center
//             justify-center
//             rounded-xl
//             ${iconClass}
//             transition-transform
//             duration-300
//             group-hover:scale-110
//           `}
//         >
//           <Icon size={20} />
//         </div>

//       </div>

//       <p className="mt-4 text-xs text-slate-400">
//         {description}
//       </p>

//     </div>
//   );
// }

// /* =====================================================
//    ACTION BUTTON
// ===================================================== */

// function ActionButton({
//   icon,
//   label,
//   onClick,
// }) {
//   return (
//     <button
//       onClick={onClick}
//       title={label}
//       className="
//         flex
//         h-9
//         items-center
//         gap-1.5
//         rounded-lg
//         border
//         border-slate-200
//         bg-white
//         px-2.5
//         text-xs
//         font-semibold
//         text-slate-600
//         transition-all
//         duration-200
//         hover:-translate-y-0.5
//         hover:border-[#F4C64E]
//         hover:bg-[#FFF9E8]
//         hover:text-slate-950
//       "
//     >
//       {icon}

//       <span className="hidden xl:inline">
//         {label}
//       </span>
//     </button>
//   );
// }

// export default Inventory;

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

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100";

function Inventory() {
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAction, setStockAction] = useState("ADD");
  const [selectedItem, setSelectedItem] = useState(null);
  const [stockQuantity, setStockQuantity] = useState("");
  const [updatingStock, setUpdatingStock] = useState(false);

  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitValue, setLimitValue] = useState("");
  const [updatingLimit, setUpdatingLimit] = useState(false);

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

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

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

      const matchesSearch = !query || searchableText.includes(query);
      const status = getStockStatus(item.quantity, item.lowStockLimit);

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "IN_STOCK" && status.label === "In Stock") ||
        (statusFilter === "LOW_STOCK" && status.label === "Low Stock") ||
        (statusFilter === "OUT_OF_STOCK" &&
          status.label === "Out of Stock");

      return matchesSearch && matchesStatus;
    });
  }, [inventory, search, statusFilter]);

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

  const openStockModal = (item, action) => {
    setSelectedItem(item);
    setStockAction(action);
    setStockQuantity("");
    setError("");
    setSuccess("");
    setShowStockModal(true);
  };

  const openLimitModal = (item) => {
    setSelectedItem(item);
    setLimitValue(String(item.lowStockLimit ?? 5));
    setError("");
    setShowLimitModal(true);
  };

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
      if (!productId) throw new Error("Product ID was not found.");

      const result =
        stockAction === "ADD"
          ? await addStock(productId, quantity)
          : await removeStock(productId, quantity);

      if (!result?.success) {
        throw new Error(result?.message || "Failed to update stock.");
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

  const handleLimitUpdate = async (event) => {
    event.preventDefault();
    if (!selectedItem) return;

    const limit = Number(limitValue);

    if (!Number.isInteger(limit) || limit < 0) {
      setError("The low-stock limit must be zero or a positive number.");
      return;
    }

    try {
      setUpdatingLimit(true);
      setError("");

      const productId = selectedItem.product?._id;
      if (!productId) throw new Error("Product ID was not found.");

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

  const stats = [
    {
      title: "Products",
      value: totalProducts,
      description: "Products in inventory",
      icon: Package,
      iconClass: "bg-blue-50 text-blue-600",
    },
    {
      title: "Total Stock",
      value: totalStock,
      description: "Available units",
      icon: Boxes,
      iconClass: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Low Stock",
      value: lowStockCount,
      description: "Need attention",
      icon: AlertTriangle,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      title: "Out of Stock",
      value: outOfStockCount,
      description: "Currently unavailable",
      icon: ShieldAlert,
      iconClass: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen w-full min-w-0 bg-[#F8F9FA]">
      <Sidebar />

      {/* The sidebar occupies 250px only on desktop.
          On mobile, content uses the full screen width. */}
      <main className="box-border min-h-screen w-full min-w-0 px-3 pb-8 pt-20 sm:px-5 lg:ml-[250px] lg:w-[calc(100%-250px)] lg:px-6 lg:pt-6 xl:px-8">
        <div className="mx-auto w-full min-w-0 space-y-5 sm:space-y-6">
          {/* Page heading */}
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Inventory
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage your shop stock and inventory
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadInventory(true)}
              disabled={refreshing}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <RefreshCw
                size={17}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          {/* Notifications */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex min-w-0 items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span className="min-w-0 flex-1 break-words">{error}</span>
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

          {/* Summary cards */}
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white"
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
                    transition={{ delay: index * 0.05 }}
                    className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium text-slate-500">
                        {stat.title}
                      </p>
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                      >
                        <Icon size={21} />
                      </div>
                    </div>

                    <p className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
                      {formatNumber(stat.value)}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {stat.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Search and filter */}
          <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
              <div className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4">
                <Search size={19} className="shrink-0 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by brand, model or barcode..."
                  aria-label="Search inventory"
                  className="w-full min-w-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                    className="shrink-0 text-slate-400 hover:text-slate-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter inventory by stock status"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-amber-400 sm:w-48"
              >
                <option value="ALL">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Showing {filteredInventory.length} of {inventory.length} products
            </p>
          </section>

          {/* Inventory table */}
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="flex min-h-56 items-center justify-center">
                <Loader2 className="animate-spin text-amber-500" size={30} />
              </div>
            ) : filteredInventory.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-4 py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                  <Smartphone size={27} />
                </div>
                <h2 className="font-semibold text-slate-800">
                  No inventory found
                </h2>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  {search || statusFilter !== "ALL"
                    ? "Try changing your search or status filter."
                    : "Inventory items will appear here when stock is available."}
                </p>
                {(search || statusFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("ALL");
                    }}
                    className="mt-4 rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Horizontal scrolling is confined to the table on small screens. */}
                <div className="w-full min-w-0 overflow-x-auto">
                  <table className="w-full min-w-[900px] border-collapse text-left">
                    <thead className="bg-slate-50">
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-5 py-4 font-semibold">Product</th>
                        <th className="px-4 py-4 font-semibold">Category</th>
                        <th className="px-4 py-4 font-semibold">Stock</th>
                        <th className="px-4 py-4 font-semibold">Status</th>
                        <th className="px-4 py-4 font-semibold">Low Limit</th>
                        <th className="px-5 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredInventory.map((item) => {
                        const product = item.product || {};
                        const status = getStockStatus(
                          item.quantity,
                          item.lowStockLimit
                        );

                        return (
                          <tr
                            key={item._id || product._id}
                            className="transition hover:bg-amber-50/30"
                          >
                            <td className="px-5 py-4">
                              <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                  <Smartphone size={20} />
                                </div>
                                <div className="min-w-0">
                                  <p className="max-w-[230px] truncate text-sm font-semibold text-slate-900">
                                    {[product.brand, product.model]
                                      .filter(Boolean)
                                      .join(" ") || "Unnamed product"}
                                  </p>
                                  <p className="mt-1 text-xs text-slate-400">
                                    {product.barcode ||
                                      item.imei ||
                                      item.serialNumber ||
                                      "No barcode"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex max-w-36 truncate rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
                                {product.category || "Uncategorized"}
                              </span>
                            </td>

                            <td className="px-4 py-4">
                              <p className="text-base font-bold text-slate-900">
                                {formatNumber(item.quantity)}
                              </p>
                              <p className="text-xs text-slate-400">units</p>
                            </td>

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

                            <td className="px-4 py-4">
                              <span className="text-sm font-semibold text-slate-700">
                                {formatNumber(item.lowStockLimit)}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  title="Add stock"
                                  aria-label={`Add stock for ${product.model || product.brand || "product"}`}
                                  onClick={() => openStockModal(item, "ADD")}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
                                >
                                  <Plus size={17} />
                                </button>

                                <button
                                  type="button"
                                  title="Remove stock"
                                  aria-label={`Remove stock for ${product.model || product.brand || "product"}`}
                                  onClick={() => openStockModal(item, "REMOVE")}
                                  disabled={Number(item.quantity || 0) === 0}
                                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                  <Minus size={17} />
                                </button>

                                {isAdmin && (
                                  <button
                                    type="button"
                                    title="Update low-stock limit"
                                    aria-label="Update low-stock limit"
                                    onClick={() => openLimitModal(item)}
                                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:-translate-y-0.5 hover:border-amber-400 hover:text-slate-950"
                                  >
                                    <ShieldAlert size={17} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-400 sm:px-5">
                  On smaller screens, swipe horizontally to view all table columns.
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Add / remove stock modal */}
      <AnimatePresence>
        {showStockModal && selectedItem && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !updatingStock) {
                setShowStockModal(false);
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="stock-modal-title"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                      stockAction === "ADD"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {stockAction === "ADD" ? (
                      <Plus size={22} />
                    ) : (
                      <Minus size={22} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="stock-modal-title"
                      className="text-lg font-bold text-slate-900"
                    >
                      {stockAction === "ADD" ? "Add Stock" : "Remove Stock"}
                    </h2>
                    <p className="truncate text-sm text-slate-500">
                      {[selectedItem.product?.brand, selectedItem.product?.model]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  disabled={updatingStock}
                  aria-label="Close modal"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={19} />
                </button>
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Current stock</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {formatNumber(selectedItem.quantity)}{" "}
                  <span className="text-sm font-medium text-slate-400">
                    units
                  </span>
                </p>
              </div>

              <form onSubmit={handleStockUpdate} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Quantity
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    autoFocus
                    value={stockQuantity}
                    onChange={(event) => setStockQuantity(event.target.value)}
                    placeholder="Enter quantity"
                    className={inputClass}
                  />
                </label>

                {error && (
                  <p className="break-words text-sm text-red-600">{error}</p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowStockModal(false)}
                    disabled={updatingStock}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingStock}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold disabled:opacity-60 sm:py-2.5 ${
                      stockAction === "ADD"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {updatingStock && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    {stockAction === "ADD" ? "Add Stock" : "Remove Stock"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Low-stock limit modal */}
      <AnimatePresence>
        {showLimitModal && selectedItem && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !updatingLimit) {
                setShowLimitModal(false);
              }
            }}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="limit-modal-title"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              className="my-auto w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <h2
                      id="limit-modal-title"
                      className="text-lg font-bold text-slate-900"
                    >
                      Low-Stock Limit
                    </h2>
                    <p className="text-sm text-slate-500">
                      Set the warning threshold
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLimitModal(false)}
                  disabled={updatingLimit}
                  aria-label="Close modal"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800"
                >
                  <X size={19} />
                </button>
              </div>

              <p className="mt-4 break-words text-sm text-slate-600">
                {[selectedItem.product?.brand, selectedItem.product?.model]
                  .filter(Boolean)
                  .join(" ")}
              </p>

              <form onSubmit={handleLimitUpdate} className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">
                    Alert when stock reaches
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={limitValue}
                    onChange={(event) => setLimitValue(event.target.value)}
                    className={inputClass}
                  />
                </label>

                {error && (
                  <p className="break-words text-sm text-red-600">{error}</p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setShowLimitModal(false)}
                    disabled={updatingLimit}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingLimit}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 sm:py-2.5"
                  >
                    {updatingLimit && (
                      <Loader2 size={16} className="animate-spin" />
                    )}
                    Save Limit
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

export default Inventory;