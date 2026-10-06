// import { useEffect, useMemo, useState } from "react";
// import {
//   Plus,
//   Search,
//   Smartphone,
//   Package,
//   Pencil,
//   Trash2,
//   Eye,
//   X,
//   Loader2,
//   AlertCircle,
//   RefreshCw,
//   IndianRupee,
//   HardDrive,
//   Palette,
//   Cpu,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// import {
//   getProducts,
//   createProduct,
//   updateProduct,
//   deleteProduct,
// } from "../../services/productService";

// function Products() {
//   const [products, setProducts] = useState([]);

//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const [search, setSearch] = useState("");
//   const [category, setCategory] = useState("ALL");

//   const [showModal, setShowModal] = useState(false);
//   const [showDetails, setShowDetails] = useState(false);

//   const [selectedProduct, setSelectedProduct] =
//     useState(null);

//   const [editingProduct, setEditingProduct] =
//     useState(null);

//   const [form, setForm] = useState({
//     brand: "",
//     model: "",
//     category: "MOBILE",
//     ram: "",
//     storage: "",
//     color: "",
//     purchasePrice: "",
//     sellingPrice: "",
//     warranty: "No Warranty",
//     guarantee: "No Guarantee",
//     description: "",
//     image: "",
//   });

//   /* =========================
//      USER
//   ========================= */

//   const user = JSON.parse(
//     localStorage.getItem("user") || "null"
//   );

//   const isAdmin = user?.role === "ADMIN";

//   /* =========================
//      LOAD PRODUCTS
//   ========================= */

//   const loadProducts = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const data = await getProducts();

//       if (data.success) {
//         setProducts(data.products || []);
//       } else {
//         setError(
//           data.message || "Failed to load products"
//         );
//       }
//     } catch (err) {
//       console.error("Products Error:", err);

//       setError(
//         err?.response?.data?.message ||
//           "Failed to load products"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadProducts();
//   }, []);

//   /* =========================
//      SEARCH + FILTER
//   ========================= */

//   const filteredProducts = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     return products.filter((product) => {
//       const matchesSearch =
//         !query ||
//         product.brand?.toLowerCase().includes(query) ||
//         product.model?.toLowerCase().includes(query) ||
//         product.category?.toLowerCase().includes(query) ||
//         product.color?.toLowerCase().includes(query);

//       const matchesCategory =
//         category === "ALL" ||
//         product.category === category;

//       return matchesSearch && matchesCategory;
//     });
//   }, [products, search, category]);

//   /* =========================
//      FORM
//   ========================= */

//   const resetForm = () => {
//     setForm({
//       brand: "",
//       model: "",
//       category: "MOBILE",
//       ram: "",
//       storage: "",
//       color: "",
//       purchasePrice: "",
//       sellingPrice: "",
//       warranty: "No Warranty",
//       guarantee: "No Guarantee",
//       description: "",
//       image: "",
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   /* =========================
//      OPEN ADD
//   ========================= */

//   const openAddModal = () => {
//     setEditingProduct(null);
//     resetForm();
//     setError("");
//     setSuccess("");
//     setShowModal(true);
//   };

//   /* =========================
//      OPEN EDIT
//   ========================= */

//   const openEditModal = (product) => {
//     setEditingProduct(product);

//     setForm({
//       brand: product.brand || "",
//       model: product.model || "",
//       category: product.category || "MOBILE",
//       ram: product.ram || "",
//       storage: product.storage || "",
//       color: product.color || "",
//       purchasePrice: product.purchasePrice ?? "",
//       sellingPrice: product.sellingPrice ?? "",
//       warranty:
//         product.warranty || "No Warranty",
//       guarantee:
//         product.guarantee || "No Guarantee",
//       description: product.description || "",
//       image: product.image || "",
//     });

//     setError("");
//     setSuccess("");
//     setShowModal(true);
//   };

//   /* =========================
//      SAVE
//   ========================= */

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setError("");
//     setSuccess("");

//     if (
//       !form.brand.trim() ||
//       !form.model.trim() ||
//       form.purchasePrice === "" ||
//       form.sellingPrice === ""
//     ) {
//       setError(
//         "Brand, model, purchase price and selling price are required."
//       );
//       return;
//     }

//     if (
//       Number(form.purchasePrice) < 0 ||
//       Number(form.sellingPrice) < 0
//     ) {
//       setError("Price cannot be negative.");
//       return;
//     }

//     try {
//       setSaving(true);

//       const productData = {
//         brand: form.brand.trim(),
//         model: form.model.trim(),
//         category: form.category,
//         ram: form.ram.trim(),
//         storage: form.storage.trim(),
//         color: form.color.trim(),
//         purchasePrice: Number(form.purchasePrice),
//         sellingPrice: Number(form.sellingPrice),
//         warranty: form.warranty.trim(),
//         guarantee: form.guarantee.trim(),
//         description: form.description.trim(),
//         image: form.image.trim(),
//       };

//       if (editingProduct) {
//         const data = await updateProduct(
//           editingProduct._id,
//           productData
//         );

//         if (!data.success) {
//           throw new Error(
//             data.message || "Failed to update product"
//           );
//         }

//         setSuccess("Product updated successfully.");
//       } else {
//         const data = await createProduct(productData);

//         if (!data.success) {
//           throw new Error(
//             data.message || "Failed to create product"
//           );
//         }

//         setSuccess("Product created successfully.");
//       }

//       await loadProducts();

//       setTimeout(() => {
//         setShowModal(false);
//         setSuccess("");
//       }, 700);
//     } catch (err) {
//       console.error("Save Product Error:", err);

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Something went wrong."
//       );
//     } finally {
//       setSaving(false);
//     }
//   };

//   /* =========================
//      DELETE
//   ========================= */

//   const handleDelete = async (product) => {
//     const confirmed = window.confirm(
//       `Are you sure you want to delete ${product.brand} ${product.model}?`
//     );

//     if (!confirmed) return;

//     try {
//       setError("");

//       const data = await deleteProduct(product._id);

//       if (!data.success) {
//         throw new Error(
//           data.message || "Failed to delete product"
//         );
//       }

//       setSuccess("Product deleted successfully.");

//       await loadProducts();

//       setTimeout(() => {
//         setSuccess("");
//       }, 2000);
//     } catch (err) {
//       console.error("Delete Product Error:", err);

//       setError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Failed to delete product"
//       );
//     }
//   };

//   /* =========================
//      VIEW
//   ========================= */

//   const openDetails = (product) => {
//     setSelectedProduct(product);
//     setShowDetails(true);
//   };

//   /* =========================
//      STATS
//   ========================= */

//   const totalProducts = products.length;

//   const mobileCount = products.filter(
//     (p) => p.category === "MOBILE"
//   ).length;

//   const accessoryCount = products.filter(
//     (p) => p.category === "ACCESSORY"
//   ).length;

//   const averageSellingPrice =
//     products.length > 0
//       ? products.reduce(
//           (sum, product) =>
//             sum + Number(product.sellingPrice || 0),
//           0
//         ) / products.length
//       : 0;

//   return (
//     <div className="min-h-screen bg-shop-cream p-4 sm:p-6 lg:p-8">

//       {/* ================= HEADER ================= */}

//       <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

//         <div>
//           <div className="flex items-center gap-3">

//             <div
//               className="
//                 flex
//                 h-12
//                 w-12
//                 items-center
//                 justify-center
//                 rounded-2xl
//                 bg-shop-black
//                 text-shop-gold
//                 shadow-lg
//               "
//             >
//               <Package size={24} />
//             </div>

//             <div>
//               <h1 className="text-3xl font-bold text-shop-text">
//                 Products
//               </h1>

//               <p className="mt-1 text-sm text-shop-muted">
//                 Manage your mobile shop products
//               </p>
//             </div>

//           </div>
//         </div>

//         {isAdmin && (
//           <motion.button
//             whileHover={{
//               scale: 1.03,
//               y: -2,
//             }}
//             whileTap={{
//               scale: 0.97,
//             }}
//             onClick={openAddModal}
//             className="
//               flex
//               items-center
//               justify-center
//               gap-2
//               rounded-xl
//               bg-shop-black
//               px-5
//               py-3
//               text-sm
//               font-bold
//               text-white
//               shadow-soft
//               transition
//               hover:bg-shop-dark
//               hover:shadow-xl
//             "
//           >
//             <Plus size={19} />
//             Add Product
//           </motion.button>
//         )}

//       </div>

//       {/* ================= ALERTS ================= */}

//       <AnimatePresence>
//         {error && (
//           <motion.div
//             initial={{
//               opacity: 0,
//               y: -10,
//             }}
//             animate={{
//               opacity: 1,
//               y: 0,
//             }}
//             exit={{
//               opacity: 0,
//               y: -10,
//             }}
//             className="
//               mb-6
//               flex
//               items-center
//               gap-3
//               rounded-xl
//               border
//               border-red-200
//               bg-red-50
//               px-4
//               py-3
//               text-sm
//               text-red-600
//             "
//           >
//             <AlertCircle size={18} />
//             {error}

//             <button
//               onClick={() => setError("")}
//               className="ml-auto"
//             >
//               <X size={17} />
//             </button>
//           </motion.div>
//         )}

//         {success && (
//           <motion.div
//             initial={{
//               opacity: 0,
//               y: -10,
//             }}
//             animate={{
//               opacity: 1,
//               y: 0,
//             }}
//             exit={{
//               opacity: 0,
//               y: -10,
//             }}
//             className="
//               mb-6
//               rounded-xl
//               border
//               border-green-200
//               bg-green-50
//               px-4
//               py-3
//               text-sm
//               text-green-600
//             "
//           >
//             {success}
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* ================= STATS ================= */}

//       <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

//         <StatCard
//           icon={<Package size={20} />}
//           title="Total Products"
//           value={totalProducts}
//         />

//         <StatCard
//           icon={<Smartphone size={20} />}
//           title="Mobile Phones"
//           value={mobileCount}
//         />

//         <StatCard
//           icon={<Package size={20} />}
//           title="Accessories"
//           value={accessoryCount}
//         />

//         <StatCard
//           icon={<IndianRupee size={20} />}
//           title="Avg. Selling Price"
//           value={`₹${averageSellingPrice.toLocaleString(
//             "en-IN",
//             {
//               maximumFractionDigits: 0,
//             }
//           )}`}
//         />

//       </div>

//       {/* ================= TOOLBAR ================= */}

//       <div
//         className="
//           mb-6
//           rounded-2xl
//           border
//           border-slate-200
//           bg-white
//           p-4
//           shadow-sm
//         "
//       >

//         <div className="flex flex-col gap-3 lg:flex-row">

//           {/* SEARCH */}

//           <div className="relative flex-1">

//             <Search
//               size={19}
//               className="
//                 absolute
//                 left-4
//                 top-1/2
//                 -translate-y-1/2
//                 text-slate-400
//               "
//             />

//             <input
//               value={search}
//               onChange={(e) =>
//                 setSearch(e.target.value)
//               }
//               placeholder="Search by brand, model, category..."
//               className="
//                 h-12
//                 w-full
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-slate-50
//                 pl-11
//                 pr-4
//                 text-sm
//                 outline-none
//                 transition
//                 focus:border-shop-gold
//                 focus:bg-white
//                 focus:ring-4
//                 focus:ring-shop-gold/10
//               "
//             />

//           </div>

//           {/* CATEGORY */}

//           <select
//             value={category}
//             onChange={(e) =>
//               setCategory(e.target.value)
//             }
//             className="
//               h-12
//               rounded-xl
//               border
//               border-slate-200
//               bg-slate-50
//               px-4
//               text-sm
//               outline-none
//               transition
//               focus:border-shop-gold
//               focus:ring-4
//               focus:ring-shop-gold/10
//             "
//           >
//             <option value="ALL">All Categories</option>
//             <option value="MOBILE">Mobile</option>
//             <option value="ACCESSORY">
//               Accessory
//             </option>
//           </select>

//           {/* REFRESH */}

//           <button
//             onClick={loadProducts}
//             className="
//               flex
//               h-12
//               items-center
//               justify-center
//               gap-2
//               rounded-xl
//               border
//               border-slate-200
//               bg-white
//               px-4
//               text-sm
//               font-semibold
//               text-slate-600
//               transition
//               hover:border-shop-gold
//               hover:text-shop-black
//             "
//           >
//             <RefreshCw size={17} />
//             Refresh
//           </button>

//         </div>
//       </div>

//       {/* ================= PRODUCTS ================= */}

//       <div
//         className="
//           overflow-hidden
//           rounded-2xl
//           border
//           border-slate-200
//           bg-white
//           shadow-sm
//         "
//       >

//         {loading ? (
//           <div
//             className="
//               flex
//               min-h-[400px]
//               flex-col
//               items-center
//               justify-center
//               gap-3
//             "
//           >
//             <Loader2
//               size={32}
//               className="
//                 animate-spin
//                 text-shop-gold
//               "
//             />

//             <p className="text-sm text-slate-500">
//               Loading products...
//             </p>
//           </div>
//         ) : filteredProducts.length === 0 ? (
//           <div
//             className="
//               flex
//               min-h-[400px]
//               flex-col
//               items-center
//               justify-center
//               px-6
//               text-center
//             "
//           >
//             <div
//               className="
//                 mb-4
//                 flex
//                 h-16
//                 w-16
//                 items-center
//                 justify-center
//                 rounded-2xl
//                 bg-slate-100
//                 text-slate-400
//               "
//             >
//               <Package size={30} />
//             </div>

//             <h3 className="text-lg font-bold text-shop-text">
//               No products found
//             </h3>

//             <p className="mt-1 max-w-sm text-sm text-slate-500">
//               {search
//                 ? "Try another search term."
//                 : "Add your first product to get started."}
//             </p>

//             {isAdmin && !search && (
//               <button
//                 onClick={openAddModal}
//                 className="
//                   mt-5
//                   flex
//                   items-center
//                   gap-2
//                   rounded-xl
//                   bg-shop-black
//                   px-4
//                   py-2.5
//                   text-sm
//                   font-semibold
//                   text-white
//                   transition
//                   hover:bg-shop-dark
//                 "
//               >
//                 <Plus size={17} />
//                 Add Product
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="overflow-x-auto">

//             <table className="w-full min-w-[950px]">

//               <thead>
//                 <tr className="border-b border-slate-200 bg-slate-50">

//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                     Product
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                     Category
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                     Specifications
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                     Purchase
//                   </th>

//                   <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
//                     Selling
//                   </th>

//                   <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
//                     Actions
//                   </th>

//                 </tr>
//               </thead>

//               <tbody>

//                 {filteredProducts.map(
//                   (product, index) => (
//                     <motion.tr
//                       key={product._id}
//                       initial={{
//                         opacity: 0,
//                         y: 8,
//                       }}
//                       animate={{
//                         opacity: 1,
//                         y: 0,
//                       }}
//                       transition={{
//                         delay: index * 0.03,
//                       }}
//                       className="
//                         border-b
//                         border-slate-100
//                         transition
//                         hover:bg-shop-cream/40
//                       "
//                     >

//                       {/* PRODUCT */}

//                       <td className="px-6 py-5">

//                         <div className="flex items-center gap-3">

//                           <div
//                             className="
//                               flex
//                               h-11
//                               w-11
//                               shrink-0
//                               items-center
//                               justify-center
//                               overflow-hidden
//                               rounded-xl
//                               bg-shop-black
//                               text-shop-gold
//                             "
//                           >
//                             {product.image ? (
//                               <img
//                                 src={product.image}
//                                 alt={product.model}
//                                 className="
//                                   h-full
//                                   w-full
//                                   object-cover
//                                 "
//                               />
//                             ) : (
//                               <Smartphone size={21} />
//                             )}
//                           </div>

//                           <div>

//                             <p className="font-bold text-shop-text">
//                               {product.brand}
//                             </p>

//                             <p className="text-sm text-slate-500">
//                               {product.model}
//                             </p>

//                             {product.color && (
//                               <p className="mt-0.5 text-xs text-slate-400">
//                                 {product.color}
//                               </p>
//                             )}

//                           </div>

//                         </div>

//                       </td>

//                       {/* CATEGORY */}

//                       <td className="px-6 py-5">

//                         <span
//                           className="
//                             rounded-full
//                             bg-shop-gold/10
//                             px-3
//                             py-1.5
//                             text-xs
//                             font-bold
//                             text-shop-black
//                           "
//                         >
//                           {product.category}
//                         </span>

//                       </td>

//                       {/* SPECS */}

//                       <td className="px-6 py-5">

//                         <div className="space-y-1 text-sm text-slate-600">

//                           {product.ram && (
//                             <div className="flex items-center gap-2">
//                               <Cpu size={14} />
//                               {product.ram} RAM
//                             </div>
//                           )}

//                           {product.storage && (
//                             <div className="flex items-center gap-2">
//                               <HardDrive size={14} />
//                               {product.storage}
//                             </div>
//                           )}

//                           {!product.ram &&
//                             !product.storage && (
//                               <span className="text-slate-400">
//                                 —
//                               </span>
//                             )}

//                         </div>

//                       </td>

//                       {/* PURCHASE */}

//                       <td className="px-6 py-5">

//                         <span className="font-semibold text-slate-600">
//                           ₹
//                           {Number(
//                             product.purchasePrice
//                           ).toLocaleString("en-IN")}
//                         </span>

//                       </td>

//                       {/* SELLING */}

//                       <td className="px-6 py-5">

//                         <span className="font-bold text-shop-black">
//                           ₹
//                           {Number(
//                             product.sellingPrice
//                           ).toLocaleString("en-IN")}
//                         </span>

//                       </td>

//                       {/* ACTIONS */}

//                       <td className="px-6 py-5">

//                         <div className="flex justify-end gap-2">

//                           <ActionButton
//                             icon={<Eye size={16} />}
//                             label="View"
//                             onClick={() =>
//                               openDetails(product)
//                             }
//                           />

//                           {isAdmin && (
//                             <>
//                               <ActionButton
//                                 icon={
//                                   <Pencil size={16} />
//                                 }
//                                 label="Edit"
//                                 onClick={() =>
//                                   openEditModal(product)
//                                 }
//                               />

//                               <ActionButton
//                                 danger
//                                 icon={
//                                   <Trash2 size={16} />
//                                 }
//                                 label="Delete"
//                                 onClick={() =>
//                                   handleDelete(product)
//                                 }
//                               />
//                             </>
//                           )}

//                         </div>

//                       </td>

//                     </motion.tr>
//                   )
//                 )}

//               </tbody>

//             </table>

//           </div>
//         )}

//       </div>

//       {/* ================= ADD / EDIT MODAL ================= */}

//       <AnimatePresence>
//         {showModal && (
//           <ProductModal
//             form={form}
//             handleChange={handleChange}
//             handleSubmit={handleSubmit}
//             editingProduct={editingProduct}
//             saving={saving}
//             success={success}
//             error={error}
//             onClose={() => {
//               if (!saving) {
//                 setShowModal(false);
//                 setError("");
//                 setSuccess("");
//               }
//             }}
//           />
//         )}
//       </AnimatePresence>

//       {/* ================= DETAILS MODAL ================= */}

//       <AnimatePresence>
//         {showDetails && selectedProduct && (
//           <ProductDetails
//             product={selectedProduct}
//             onClose={() => {
//               setShowDetails(false);
//               setSelectedProduct(null);
//             }}
//           />
//         )}
//       </AnimatePresence>

//     </div>
//   );
// }

// /* =====================================================
//    STAT CARD
// ===================================================== */

// function StatCard({ icon, title, value }) {
//   return (
//     <motion.div
//       whileHover={{
//         y: -5,
//         scale: 1.01,
//       }}
//       className="
//         rounded-2xl
//         border
//         border-slate-200
//         bg-white
//         p-5
//         shadow-sm
//         transition-shadow
//         hover:shadow-lg
//       "
//     >

//       <div className="flex items-center justify-between">

//         <div
//           className="
//             flex
//             h-11
//             w-11
//             items-center
//             justify-center
//             rounded-xl
//             bg-shop-black
//             text-shop-gold
//           "
//         >
//           {icon}
//         </div>

//         <span className="text-xs font-medium text-slate-400">
//           Ganesh Shop
//         </span>

//       </div>

//       <p className="mt-5 text-sm text-slate-500">
//         {title}
//       </p>

//       <p className="mt-1 text-2xl font-bold text-shop-text">
//         {value}
//       </p>

//     </motion.div>
//   );
// }

// /* =====================================================
//    ACTION BUTTON
// ===================================================== */

// function ActionButton({
//   icon,
//   label,
//   onClick,
//   danger = false,
// }) {
//   return (
//     <button
//       onClick={onClick}
//       title={label}
//       className={`
//         flex
//         h-9
//         w-9
//         items-center
//         justify-center
//         rounded-lg
//         border
//         transition
//         ${
//           danger
//             ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
//             : "border-slate-200 bg-white text-slate-500 hover:border-shop-gold hover:bg-shop-gold/10 hover:text-shop-black"
//         }
//       `}
//     >
//       {icon}
//     </button>
//   );
// }

// /* =====================================================
//    PRODUCT MODAL
// ===================================================== */

// function ProductModal({
//   form,
//   handleChange,
//   handleSubmit,
//   editingProduct,
//   saving,
//   success,
//   error,
//   onClose,
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="
//         fixed
//         inset-0
//         z-50
//         flex
//         items-center
//         justify-center
//         bg-black/50
//         p-4
//         backdrop-blur-sm
//       "
//     >

//       <motion.div
//         initial={{
//           opacity: 0,
//           scale: 0.95,
//           y: 20,
//         }}
//         animate={{
//           opacity: 1,
//           scale: 1,
//           y: 0,
//         }}
//         exit={{
//           opacity: 0,
//           scale: 0.95,
//           y: 20,
//         }}
//         className="
//           max-h-[92vh]
//           w-full
//           max-w-3xl
//           overflow-y-auto
//           rounded-3xl
//           bg-white
//           shadow-2xl
//         "
//       >

//         {/* HEADER */}

//         <div
//           className="
//             sticky
//             top-0
//             z-10
//             flex
//             items-center
//             justify-between
//             border-b
//             border-slate-200
//             bg-white
//             px-6
//             py-5
//           "
//         >

//           <div>

//             <h2 className="text-xl font-bold text-shop-text">
//               {editingProduct
//                 ? "Edit Product"
//                 : "Add Product"}
//             </h2>

//             <p className="mt-1 text-sm text-slate-500">
//               {editingProduct
//                 ? "Update product information"
//                 : "Add a new product to your catalog"}
//             </p>

//           </div>

//           <button
//             onClick={onClose}
//             disabled={saving}
//             className="
//               rounded-xl
//               p-2
//               text-slate-400
//               transition
//               hover:bg-slate-100
//               hover:text-shop-black
//             "
//           >
//             <X size={20} />
//           </button>

//         </div>

//         {/* FORM */}

//         <form
//           onSubmit={handleSubmit}
//           className="space-y-6 p-6"
//         >

//           {/* BASIC INFO */}

//           <div>

//             <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
//               Basic Information
//             </h3>

//             <div className="grid gap-4 sm:grid-cols-2">

//               <FormInput
//                 label="Brand *"
//                 name="brand"
//                 value={form.brand}
//                 onChange={handleChange}
//                 placeholder="e.g. Apple"
//               />

//               <FormInput
//                 label="Model *"
//                 name="model"
//                 value={form.model}
//                 onChange={handleChange}
//                 placeholder="e.g. iPhone 15"
//               />

//               <FormSelect
//                 label="Category"
//                 name="category"
//                 value={form.category}
//                 onChange={handleChange}
//                 options={[
//                   {
//                     value: "MOBILE",
//                     label: "Mobile",
//                   },
//                   {
//                     value: "ACCESSORY",
//                     label: "Accessory",
//                   },
//                 ]}
//               />

//               <FormInput
//                 label="Color"
//                 name="color"
//                 value={form.color}
//                 onChange={handleChange}
//                 placeholder="e.g. Black"
//               />

//             </div>

//           </div>

//           {/* SPECIFICATIONS */}

//           <div>

//             <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
//               Specifications
//             </h3>

//             <div className="grid gap-4 sm:grid-cols-2">

//               <FormInput
//                 label="RAM"
//                 name="ram"
//                 value={form.ram}
//                 onChange={handleChange}
//                 placeholder="e.g. 8GB"
//               />

//               <FormInput
//                 label="Storage"
//                 name="storage"
//                 value={form.storage}
//                 onChange={handleChange}
//                 placeholder="e.g. 256GB"
//               />

//             </div>

//           </div>

//           {/* PRICES */}

//           <div>

//             <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
//               Pricing
//             </h3>

//             <div className="grid gap-4 sm:grid-cols-2">

//               <FormInput
//                 label="Purchase Price *"
//                 name="purchasePrice"
//                 type="number"
//                 min="0"
//                 value={form.purchasePrice}
//                 onChange={handleChange}
//                 placeholder="0"
//               />

//               <FormInput
//                 label="Selling Price *"
//                 name="sellingPrice"
//                 type="number"
//                 min="0"
//                 value={form.sellingPrice}
//                 onChange={handleChange}
//                 placeholder="0"
//               />

//             </div>

//           </div>

//           {/* WARRANTY */}

//           <div>

//             <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
//               Warranty & Guarantee
//             </h3>

//             <div className="grid gap-4 sm:grid-cols-2">

//               <FormInput
//                 label="Warranty"
//                 name="warranty"
//                 value={form.warranty}
//                 onChange={handleChange}
//                 placeholder="e.g. 1 Year"
//               />

//               <FormInput
//                 label="Guarantee"
//                 name="guarantee"
//                 value={form.guarantee}
//                 onChange={handleChange}
//                 placeholder="e.g. 6 Months"
//               />

//             </div>

//           </div>

//           {/* IMAGE */}

//           <FormInput
//             label="Image URL"
//             name="image"
//             value={form.image}
//             onChange={handleChange}
//             placeholder="https://example.com/product.jpg"
//           />

//           {/* DESCRIPTION */}

//           <div>

//             <label className="mb-2 block text-sm font-semibold text-shop-text">
//               Description
//             </label>

//             <textarea
//               name="description"
//               value={form.description}
//               onChange={handleChange}
//               rows={4}
//               placeholder="Enter product description..."
//               className="
//                 w-full
//                 rounded-xl
//                 border
//                 border-slate-200
//                 bg-slate-50
//                 px-4
//                 py-3
//                 text-sm
//                 outline-none
//                 transition
//                 focus:border-shop-gold
//                 focus:bg-white
//                 focus:ring-4
//                 focus:ring-shop-gold/10
//               "
//             />

//           </div>

//           {/* ERROR */}

//           {error && (
//             <div
//               className="
//                 rounded-xl
//                 border
//                 border-red-200
//                 bg-red-50
//                 px-4
//                 py-3
//                 text-sm
//                 text-red-600
//               "
//             >
//               {error}
//             </div>
//           )}

//           {/* SUCCESS */}

//           {success && (
//             <div
//               className="
//                 rounded-xl
//                 border
//                 border-green-200
//                 bg-green-50
//                 px-4
//                 py-3
//                 text-sm
//                 text-green-600
//               "
//             >
//               {success}
//             </div>
//           )}

//           {/* BUTTONS */}

//           <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

//             <button
//               type="button"
//               onClick={onClose}
//               disabled={saving}
//               className="
//                 rounded-xl
//                 border
//                 border-slate-200
//                 px-5
//                 py-3
//                 text-sm
//                 font-semibold
//                 text-slate-600
//                 transition
//                 hover:bg-slate-50
//               "
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={saving}
//               className="
//                 flex
//                 items-center
//                 justify-center
//                 gap-2
//                 rounded-xl
//                 bg-shop-black
//                 px-6
//                 py-3
//                 text-sm
//                 font-bold
//                 text-white
//                 transition
//                 hover:bg-shop-dark
//                 disabled:cursor-not-allowed
//                 disabled:opacity-60
//               "
//             >

//               {saving && (
//                 <Loader2
//                   size={17}
//                   className="animate-spin"
//                 />
//               )}

//               {saving
//                 ? "Saving..."
//                 : editingProduct
//                 ? "Update Product"
//                 : "Create Product"}

//             </button>

//           </div>

//         </form>

//       </motion.div>
//     </motion.div>
//   );
// }

// /* =====================================================
//    FORM INPUT
// ===================================================== */

// function FormInput({
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   min,
// }) {
//   return (
//     <div>

//       <label className="mb-2 block text-sm font-semibold text-shop-text">
//         {label}
//       </label>

//       <input
//         type={type}
//         name={name}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         min={min}
//         className="
//           h-12
//           w-full
//           rounded-xl
//           border
//           border-slate-200
//           bg-slate-50
//           px-4
//           text-sm
//           outline-none
//           transition
//           focus:border-shop-gold
//           focus:bg-white
//           focus:ring-4
//           focus:ring-shop-gold/10
//         "
//       />

//     </div>
//   );
// }

// /* =====================================================
//    FORM SELECT
// ===================================================== */

// function FormSelect({
//   label,
//   name,
//   value,
//   onChange,
//   options,
// }) {
//   return (
//     <div>

//       <label className="mb-2 block text-sm font-semibold text-shop-text">
//         {label}
//       </label>

//       <select
//         name={name}
//         value={value}
//         onChange={onChange}
//         className="
//           h-12
//           w-full
//           rounded-xl
//           border
//           border-slate-200
//           bg-slate-50
//           px-4
//           text-sm
//           outline-none
//           transition
//           focus:border-shop-gold
//           focus:bg-white
//           focus:ring-4
//           focus:ring-shop-gold/10
//         "
//       >
//         {options.map((option) => (
//           <option
//             key={option.value}
//             value={option.value}
//           >
//             {option.label}
//           </option>
//         ))}
//       </select>

//     </div>
//   );
// }

// /* =====================================================
//    PRODUCT DETAILS
// ===================================================== */

// function ProductDetails({
//   product,
//   onClose,
// }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="
//         fixed
//         inset-0
//         z-50
//         flex
//         items-center
//         justify-center
//         bg-black/50
//         p-4
//         backdrop-blur-sm
//       "
//     >

//       <motion.div
//         initial={{
//           opacity: 0,
//           scale: 0.95,
//         }}
//         animate={{
//           opacity: 1,
//           scale: 1,
//         }}
//         exit={{
//           opacity: 0,
//           scale: 0.95,
//         }}
//         className="
//           w-full
//           max-w-lg
//           overflow-hidden
//           rounded-3xl
//           bg-white
//           shadow-2xl
//         "
//       >

//         <div
//           className="
//             flex
//             items-center
//             justify-between
//             border-b
//             border-slate-200
//             px-6
//             py-5
//           "
//         >

//           <div>
//             <p className="text-xs font-bold uppercase tracking-wider text-shop-gold">
//               Product Details
//             </p>

//             <h2 className="mt-1 text-xl font-bold text-shop-text">
//               {product.brand} {product.model}
//             </h2>
//           </div>

//           <button
//             onClick={onClose}
//             className="
//               rounded-xl
//               p-2
//               text-slate-400
//               hover:bg-slate-100
//               hover:text-shop-black
//             "
//           >
//             <X size={20} />
//           </button>

//         </div>

//         <div className="p-6">

//           <div
//             className="
//               mb-6
//               flex
//               h-40
//               items-center
//               justify-center
//               overflow-hidden
//               rounded-2xl
//               bg-shop-black
//             "
//           >

//             {product.image ? (
//               <img
//                 src={product.image}
//                 alt={product.model}
//                 className="h-full w-full object-cover"
//               />
//             ) : (
//               <Smartphone
//                 size={60}
//                 className="text-shop-gold"
//               />
//             )}

//           </div>

//           <div className="grid grid-cols-2 gap-3">

//             <Detail
//               label="Brand"
//               value={product.brand}
//             />

//             <Detail
//               label="Model"
//               value={product.model}
//             />

//             <Detail
//               label="Category"
//               value={product.category}
//             />

//             <Detail
//               label="Color"
//               value={product.color || "—"}
//             />

//             <Detail
//               label="RAM"
//               value={product.ram || "—"}
//             />

//             <Detail
//               label="Storage"
//               value={product.storage || "—"}
//             />

//             <Detail
//               label="Purchase Price"
//               value={`₹${Number(
//                 product.purchasePrice || 0
//               ).toLocaleString("en-IN")}`}
//             />

//             <Detail
//               label="Selling Price"
//               value={`₹${Number(
//                 product.sellingPrice || 0
//               ).toLocaleString("en-IN")}`}
//             />

//             <Detail
//               label="Warranty"
//               value={
//                 product.warranty || "No Warranty"
//               }
//             />

//             <Detail
//               label="Guarantee"
//               value={
//                 product.guarantee ||
//                 "No Guarantee"
//               }
//             />

//           </div>

//           {product.description && (
//             <div className="mt-5">

//               <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
//                 Description
//               </p>

//               <p className="mt-2 text-sm leading-6 text-slate-600">
//                 {product.description}
//               </p>

//             </div>
//           )}

//         </div>

//       </motion.div>

//     </motion.div>
//   );
// }

// /* =====================================================
//    DETAIL
// ===================================================== */

// function Detail({ label, value }) {
//   return (
//     <div className="rounded-xl bg-slate-50 p-3">

//       <p className="text-xs text-slate-400">
//         {label}
//       </p>

//       <p className="mt-1 text-sm font-semibold text-shop-text">
//         {value}
//       </p>

//     </div>
//   );
// }

// export default Products;


import { useEffect, useMemo, useState } from "react";

import {
  Plus,
  Search,
  Smartphone,
  Package,
  Pencil,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  HardDrive,
  Cpu,
  ScanLine,
  CheckCircle2,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

import { scanProductBarcode } from "../../services/barcodeService";

import BarcodeScanner from "../../components/products/BarcodeScanner";


function Products() {
  // =====================================================
  // PRODUCTS
  // =====================================================

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [scanning, setScanning] = useState(false);


  // =====================================================
  // ALERTS
  // =====================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // =====================================================
  // SEARCH
  // =====================================================

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("ALL");


  // =====================================================
  // MODALS
  // =====================================================

  const [showModal, setShowModal] = useState(false);

  const [showDetails, setShowDetails] = useState(false);

  const [showScanner, setShowScanner] = useState(false);


  // =====================================================
  // SELECTED PRODUCT
  // =====================================================

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [editingProduct, setEditingProduct] = useState(null);


  // =====================================================
  // FORM
  // =====================================================

  const [form, setForm] = useState({
    barcode: "",
    brand: "",
    model: "",
    category: "MOBILE",
    ram: "",
    storage: "",
    color: "",
    purchasePrice: "",
    sellingPrice: "",
    warranty: "No Warranty",
    guarantee: "No Guarantee",
    description: "",
    image: "",
  });


  // =====================================================
  // USER
  // =====================================================

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );

  const isAdmin = user?.role === "ADMIN";


  // =====================================================
  // LOAD PRODUCTS
  // =====================================================

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(
          data.message || "Failed to load products"
        );
      }
    } catch (err) {
      console.error("Products Error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load products"
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadProducts();
  }, []);


  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.barcode?.toLowerCase().includes(query) ||
        product.brand?.toLowerCase().includes(query) ||
        product.model?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query) ||
        product.color?.toLowerCase().includes(query);

      const matchesCategory =
        category === "ALL" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);


  // =====================================================
  // RESET FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      barcode: "",
      brand: "",
      model: "",
      category: "MOBILE",
      ram: "",
      storage: "",
      color: "",
      purchasePrice: "",
      sellingPrice: "",
      warranty: "No Warranty",
      guarantee: "No Guarantee",
      description: "",
      image: "",
    });
  };


  // =====================================================
  // FORM CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // =====================================================
  // OPEN ADD
  // =====================================================

  const openAddModal = () => {
    setEditingProduct(null);

    resetForm();

    setError("");

    setSuccess("");

    setShowModal(true);
  };


  // =====================================================
  // OPEN EDIT
  // =====================================================

  const openEditModal = (product) => {
    setEditingProduct(product);

    setForm({
      barcode: product.barcode || "",
      brand: product.brand || "",
      model: product.model || "",
      category: product.category || "MOBILE",
      ram: product.ram || "",
      storage: product.storage || "",
      color: product.color || "",
      purchasePrice: product.purchasePrice ?? "",
      sellingPrice: product.sellingPrice ?? "",
      warranty:
        product.warranty || "No Warranty",
      guarantee:
        product.guarantee || "No Guarantee",
      description: product.description || "",
      image: product.image || "",
    });

    setError("");

    setSuccess("");

    setShowModal(true);
  };


  // =====================================================
  // BARCODE SCAN
  // =====================================================

  const handleBarcodeScan = async (scanResult) => {
  try {
    setShowScanner(false);

    setScanning(true);

    setError("");

    setSuccess("");

    /*
    ============================================================
    GET BARCODE + OCR TEXT
    ============================================================
    */

    const barcode =
      typeof scanResult === "string"
        ? scanResult
        : scanResult?.barcode || "";

    const ocrText =
      typeof scanResult === "string"
        ? ""
        : scanResult?.ocrText || "";

    console.log("Barcode:", barcode);

    console.log("OCR Text:", ocrText);

    /*
    ============================================================
    SEND BOTH TO BACKEND
    ============================================================
    */

    const data = await scanProductBarcode(
      barcode,
      ocrText
    );

    /*
    ============================================================
    PRODUCT FOUND
    ============================================================
    */

    if (
      data.success &&
      data.found &&
      data.product
    ) {
      const product = data.product;

      setForm({
        barcode:
          product.barcode || barcode,

        brand:
          product.brand || "",

        model:
          product.model || "",

        category:
          product.category || "MOBILE",

        ram:
          product.ram || "",

        storage:
          product.storage || "",

        color:
          product.color || "",

        purchasePrice:
          product.purchasePrice ?? "",

        sellingPrice:
          product.sellingPrice ?? "",

        warranty:
          product.warranty ||
          "No Warranty",

        guarantee:
          product.guarantee ||
          "No Guarantee",

        description:
          product.description || "",

        image:
          product.image || "",
      });

      setSuccess(
        data.message ||
          "Product details detected automatically."
      );

      setShowModal(true);

      return;
    }

    /*
    ============================================================
    NOT FOUND
    ============================================================
    */

    setForm((prev) => ({
      ...prev,

      barcode:
        barcode || prev.barcode,

      /*
      Backend may still return partial
      OCR information.
      */

      brand:
        data.product?.brand ||
        prev.brand,

      model:
        data.product?.model ||
        prev.model,

      category:
        data.product?.category ||
        prev.category,

      ram:
        data.product?.ram ||
        prev.ram,

      storage:
        data.product?.storage ||
        prev.storage,

      color:
        data.product?.color ||
        prev.color,

      description:
        data.product?.description ||
        prev.description,

      image:
        data.product?.image ||
        prev.image,
    }));

    setShowModal(true);

    setSuccess(
      data.message ||
        "Information detected. Please verify the details and enter price."
    );
  } catch (err) {
    console.error(
      "Product Scan Error:",
      err
    );

    setError(
      err?.response?.data?.message ||
        "Failed to process product scan."
    );

    setShowModal(true);
  } finally {
    setScanning(false);
  }
};


  // =====================================================
  // SAVE PRODUCT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    setSuccess("");


    // Validation
    if (
      !form.brand.trim() ||
      !form.model.trim() ||
      form.purchasePrice === "" ||
      form.sellingPrice === ""
    ) {
      setError(
        "Brand, model, purchase price and selling price are required."
      );

      return;
    }


    if (
      Number(form.purchasePrice) < 0 ||
      Number(form.sellingPrice) < 0
    ) {
      setError("Price cannot be negative.");

      return;
    }


    try {
      setSaving(true);


      const productData = {
        barcode: form.barcode.trim(),

        brand: form.brand.trim(),

        model: form.model.trim(),

        category: form.category,

        ram: form.ram.trim(),

        storage: form.storage.trim(),

        color: form.color.trim(),

        purchasePrice:
          Number(form.purchasePrice),

        sellingPrice:
          Number(form.sellingPrice),

        warranty:
          form.warranty.trim(),

        guarantee:
          form.guarantee.trim(),

        description:
          form.description.trim(),

        image:
          form.image.trim(),
      };


      // UPDATE
      if (editingProduct) {
        const data = await updateProduct(
          editingProduct._id,
          productData
        );

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to update product"
          );
        }

        setSuccess(
          "Product updated successfully."
        );
      }

      // CREATE
      else {
        const data = await createProduct(
          productData
        );

        if (!data.success) {
          throw new Error(
            data.message ||
              "Failed to create product"
          );
        }

        setSuccess(
          "Product created successfully."
        );
      }


      await loadProducts();


      setTimeout(() => {
        setShowModal(false);

        setSuccess("");
      }, 700);


    } catch (err) {
      console.error(
        "Save Product Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.brand} ${product.model}?`
    );

    if (!confirmed) return;


    try {
      setError("");

      const data =
        await deleteProduct(product._id);


      if (!data.success) {
        throw new Error(
          data.message ||
            "Failed to delete product"
        );
      }


      setSuccess(
        "Product deleted successfully."
      );


      await loadProducts();


      setTimeout(() => {
        setSuccess("");
      }, 2000);

    } catch (err) {
      console.error(
        "Delete Product Error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product"
      );
    }
  };


  // =====================================================
  // VIEW
  // =====================================================

  const openDetails = (product) => {
    setSelectedProduct(product);

    setShowDetails(true);
  };


  // =====================================================
  // STATS
  // =====================================================

  const totalProducts = products.length;

  const mobileCount =
    products.filter(
      (p) => p.category === "MOBILE"
    ).length;

  const accessoryCount =
    products.filter(
      (p) => p.category === "ACCESSORY"
    ).length;


  const averageSellingPrice =
    products.length > 0
      ? products.reduce(
          (sum, product) =>
            sum +
            Number(
              product.sellingPrice || 0
            ),
          0
        ) / products.length
      : 0;


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-shop-cream p-4 sm:p-6 lg:p-8">

      {/* HEADER */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>
          <div className="flex items-center gap-3">

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-2xl
                bg-shop-black
                text-shop-gold
                shadow-lg
              "
            >
              <Package size={24} />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-shop-text">
                Products
              </h1>

              <p className="mt-1 text-sm text-shop-muted">
                Manage your mobile shop products
              </p>
            </div>

          </div>
        </div>


        {isAdmin && (
          <motion.button
            whileHover={{
              scale: 1.03,
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
            onClick={openAddModal}
            className="
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-shop-black
              px-5
              py-3
              text-sm
              font-bold
              text-white
              shadow-soft
              transition
              hover:bg-shop-dark
              hover:shadow-xl
            "
          >
            <Plus size={19} />

            Add Product
          </motion.button>
        )}

      </div>


      {/* ALERTS */}

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
              mb-6
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
            <AlertCircle size={18} />

            {error}

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
              mb-6
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-green-200
              bg-green-50
              px-4
              py-3
              text-sm
              text-green-600
            "
          >
            <CheckCircle2 size={18} />

            {success}
          </motion.div>
        )}

      </AnimatePresence>


      {/* STATS */}

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <StatCard
          icon={<Package size={20} />}
          title="Total Products"
          value={totalProducts}
        />

        <StatCard
          icon={<Smartphone size={20} />}
          title="Mobile Phones"
          value={mobileCount}
        />

        <StatCard
          icon={<Package size={20} />}
          title="Accessories"
          value={accessoryCount}
        />

        <StatCard
          icon={<IndianRupee size={20} />}
          title="Avg. Selling Price"
          value={`₹${averageSellingPrice.toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 0,
            }
          )}`}
        />

      </div>


      {/* TOOLBAR */}

      <div
        className="
          mb-6
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-sm
        "
      >

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
              placeholder="Search by barcode, brand, model, category..."
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
                outline-none
                transition
                focus:border-shop-gold
                focus:bg-white
                focus:ring-4
                focus:ring-shop-gold/10
              "
            />

          </div>


          {/* CATEGORY */}

          <select
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            className="
              h-12
              rounded-xl
              border
              border-slate-200
              bg-slate-50
              px-4
              text-sm
              outline-none
              transition
              focus:border-shop-gold
              focus:ring-4
              focus:ring-shop-gold/10
            "
          >
            <option value="ALL">
              All Categories
            </option>

            <option value="MOBILE">
              Mobile
            </option>

            <option value="ACCESSORY">
              Accessory
            </option>
          </select>


          {/* REFRESH */}

          <button
            onClick={loadProducts}
            className="
              flex
              h-12
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
              transition
              hover:border-shop-gold
              hover:text-shop-black
            "
          >
            <RefreshCw size={17} />

            Refresh
          </button>

        </div>

      </div>


      {/* PRODUCTS */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >

        {loading ? (

          <div
            className="
              flex
              min-h-[400px]
              flex-col
              items-center
              justify-center
              gap-3
            "
          >
            <Loader2
              size={32}
              className="
                animate-spin
                text-shop-gold
              "
            />

            <p className="text-sm text-slate-500">
              Loading products...
            </p>
          </div>

        ) : filteredProducts.length === 0 ? (

          <div
            className="
              flex
              min-h-[400px]
              flex-col
              items-center
              justify-center
              px-6
              text-center
            "
          >

            <div
              className="
                mb-4
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-2xl
                bg-slate-100
                text-slate-400
              "
            >
              <Package size={30} />
            </div>

            <h3 className="text-lg font-bold text-shop-text">
              No products found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              {search
                ? "Try another search term."
                : "Add your first product to get started."}
            </p>

            {isAdmin && !search && (
              <button
                onClick={openAddModal}
                className="
                  mt-5
                  flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-shop-black
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-shop-dark
                "
              >
                <Plus size={17} />

                Add Product
              </button>
            )}

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
                    Barcode
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Specifications
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Purchase
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                    Selling
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>

                {filteredProducts.map(
                  (product, index) => (

                    <motion.tr
                      key={product._id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.03,
                      }}
                      className="
                        border-b
                        border-slate-100
                        transition
                        hover:bg-shop-cream/40
                      "
                    >

                      {/* PRODUCT */}

                      <td className="px-6 py-5">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-xl
                              bg-shop-black
                              text-shop-gold
                            "
                          >

                            {product.image ? (

                              <img
                                src={
                                  product.image
                                }
                                alt={
                                  product.model
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />

                            ) : (

                              <Smartphone
                                size={21}
                              />

                            )}

                          </div>


                          <div>

                            <p className="font-bold text-shop-text">
                              {product.brand}
                            </p>

                            <p className="text-sm text-slate-500">
                              {product.model}
                            </p>

                            {product.color && (
                              <p className="mt-0.5 text-xs text-slate-400">
                                {product.color}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>


                      {/* BARCODE */}

                      <td className="px-6 py-5">

                        {product.barcode ? (

                          <span className="rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-xs font-semibold text-slate-600">
                            {product.barcode}
                          </span>

                        ) : (

                          <span className="text-slate-400">
                            —
                          </span>

                        )}

                      </td>


                      {/* CATEGORY */}

                      <td className="px-6 py-5">

                        <span
                          className="
                            rounded-full
                            bg-shop-gold/10
                            px-3
                            py-1.5
                            text-xs
                            font-bold
                            text-shop-black
                          "
                        >
                          {product.category}
                        </span>

                      </td>


                      {/* SPECS */}

                      <td className="px-6 py-5">

                        <div className="space-y-1 text-sm text-slate-600">

                          {product.ram && (
                            <div className="flex items-center gap-2">
                              <Cpu size={14} />
                              {product.ram} RAM
                            </div>
                          )}

                          {product.storage && (
                            <div className="flex items-center gap-2">
                              <HardDrive size={14} />
                              {product.storage}
                            </div>
                          )}

                          {!product.ram &&
                            !product.storage && (
                              <span className="text-slate-400">
                                —
                              </span>
                            )}

                        </div>

                      </td>


                      {/* PURCHASE */}

                      <td className="px-6 py-5">

                        <span className="font-semibold text-slate-600">
                          ₹
                          {Number(
                            product.purchasePrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </td>


                      {/* SELLING */}

                      <td className="px-6 py-5">

                        <span className="font-bold text-shop-black">
                          ₹
                          {Number(
                            product.sellingPrice
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </td>


                      {/* ACTIONS */}

                      <td className="px-6 py-5">

                        <div className="flex justify-end gap-2">

                          <ActionButton
                            icon={
                              <Eye
                                size={16}
                              />
                            }
                            label="View"
                            onClick={() =>
                              openDetails(
                                product
                              )
                            }
                          />

                          {isAdmin && (
                            <>
                              <ActionButton
                                icon={
                                  <Pencil
                                    size={16}
                                  />
                                }
                                label="Edit"
                                onClick={() =>
                                  openEditModal(
                                    product
                                  )
                                }
                              />

                              <ActionButton
                                danger
                                icon={
                                  <Trash2
                                    size={16}
                                  />
                                }
                                label="Delete"
                                onClick={() =>
                                  handleDelete(
                                    product
                                  )
                                }
                              />
                            </>
                          )}

                        </div>

                      </td>

                    </motion.tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* ADD / EDIT MODAL */}

      <AnimatePresence>

        {showModal && (

          <ProductModal
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            editingProduct={editingProduct}
            saving={saving}
            scanning={scanning}
            success={success}
            error={error}
            onScanClick={() =>
              setShowScanner(true)
            }
            onClose={() => {
              if (!saving) {
                setShowModal(false);
                setError("");
                setSuccess("");
              }
            }}
          />

        )}

      </AnimatePresence>


      {/* SCANNER */}

      <AnimatePresence>

        {showScanner && (

          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() =>
              setShowScanner(false)
            }
          />

        )}

      </AnimatePresence>


      {/* DETAILS MODAL */}

      <AnimatePresence>

        {showDetails &&
          selectedProduct && (

            <ProductDetails
              product={selectedProduct}
              onClose={() => {
                setShowDetails(false);
                setSelectedProduct(null);
              }}
            />

          )}

      </AnimatePresence>

    </div>
  );
}


// =====================================================
// STAT CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
}) {
  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.01,
      }}
      className="
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-shadow
        hover:shadow-lg
      "
    >

      <div className="flex items-center justify-between">

        <div
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-shop-black
            text-shop-gold
          "
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-slate-400">
          Ganesh Shop
        </span>

      </div>

      <p className="mt-5 text-sm text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-bold text-shop-text">
        {value}
      </p>

    </motion.div>
  );
}


// =====================================================
// ACTION BUTTON
// =====================================================

function ActionButton({
  icon,
  label,
  onClick,
  danger = false,
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-lg
        border
        transition

        ${
          danger
            ? "border-red-100 bg-red-50 text-red-500 hover:bg-red-100"
            : "border-slate-200 bg-white text-slate-500 hover:border-shop-gold hover:bg-shop-gold/10 hover:text-shop-black"
        }
      `}
    >
      {icon}
    </button>
  );
}


// =====================================================
// PRODUCT MODAL
// =====================================================

function ProductModal({
  form,
  handleChange,
  handleSubmit,
  editingProduct,
  saving,
  scanning,
  success,
  error,
  onScanClick,
  onClose,
}) {
  return (
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
        bg-black/50
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
        className="
          max-h-[92vh]
          w-full
          max-w-3xl
          overflow-y-auto
          rounded-3xl
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            bg-white
            px-6
            py-5
          "
        >

          <div>

            <h2 className="text-xl font-bold text-shop-text">
              {editingProduct
                ? "Edit Product"
                : "Add Product"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {editingProduct
                ? "Update product information"
                : "Add a new product to your catalog"}
            </p>

          </div>


          <button
            onClick={onClose}
            disabled={saving}
            className="
              rounded-xl
              p-2
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-shop-black
            "
          >
            <X size={20} />
          </button>

        </div>


        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >

          {/* SCAN PRODUCT */}

          {!editingProduct && (

            <div className="rounded-2xl border border-shop-gold/30 bg-shop-cream p-5">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <div className="flex items-center gap-2">

                    <ScanLine
                      size={20}
                      className="text-shop-black"
                    />

                    <h3 className="text-base font-bold text-shop-black">
                      Scan Product
                    </h3>

                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Scan the barcode to find an existing product.
                  </p>

                </div>


                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.03,
                    y: -2,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={onScanClick}
                  disabled={scanning}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-shop-black
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    transition
                    hover:bg-shop-dark
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {scanning ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <ScanLine size={18} />
                  )}

                  {scanning
                    ? "Scanning..."
                    : "Scan Product"}

                </motion.button>

              </div>


              {form.barcode && (

                <div className="mt-4 rounded-xl bg-white px-4 py-3">

                  <p className="text-xs font-medium text-slate-400">
                    Scanned Barcode
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-shop-text">
                    {form.barcode}
                  </p>

                </div>

              )}

            </div>

          )}


          {/* BASIC INFO */}

          <div>

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
              Basic Information
            </h3>


            <div className="grid gap-4 sm:grid-cols-2">

              <FormInput
                label="Brand *"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. Apple"
              />

              <FormInput
                label="Model *"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="e.g. iPhone 15"
              />

              <FormSelect
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                options={[
                  {
                    value: "MOBILE",
                    label: "Mobile",
                  },
                  {
                    value: "ACCESSORY",
                    label: "Accessory",
                  },
                ]}
              />

              <FormInput
                label="Color"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="e.g. Black"
              />

            </div>

          </div>


          {/* SPECIFICATIONS */}

          <div>

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
              Specifications
            </h3>


            <div className="grid gap-4 sm:grid-cols-2">

              <FormInput
                label="RAM"
                name="ram"
                value={form.ram}
                onChange={handleChange}
                placeholder="e.g. 8GB"
              />

              <FormInput
                label="Storage"
                name="storage"
                value={form.storage}
                onChange={handleChange}
                placeholder="e.g. 256GB"
              />

            </div>

          </div>


          {/* PRICES */}

          <div>

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
              Pricing
            </h3>


            <div className="grid gap-4 sm:grid-cols-2">

              <FormInput
                label="Purchase Price *"
                name="purchasePrice"
                type="number"
                min="0"
                value={form.purchasePrice}
                onChange={handleChange}
                placeholder="0"
              />

              <FormInput
                label="Selling Price *"
                name="sellingPrice"
                type="number"
                min="0"
                value={form.sellingPrice}
                onChange={handleChange}
                placeholder="0"
              />

            </div>

          </div>


          {/* WARRANTY */}

          <div>

            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-shop-black">
              Warranty & Guarantee
            </h3>


            <div className="grid gap-4 sm:grid-cols-2">

              <FormInput
                label="Warranty"
                name="warranty"
                value={form.warranty}
                onChange={handleChange}
                placeholder="e.g. 1 Year"
              />

              <FormInput
                label="Guarantee"
                name="guarantee"
                value={form.guarantee}
                onChange={handleChange}
                placeholder="e.g. 6 Months"
              />

            </div>

          </div>


          {/* IMAGE */}

          <FormInput
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/product.jpg"
          />


          {/* DESCRIPTION */}

          <div>

            <label className="mb-2 block text-sm font-semibold text-shop-text">
              Description
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter product description..."
              className="
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-4
                py-3
                text-sm
                outline-none
                transition
                focus:border-shop-gold
                focus:bg-white
                focus:ring-4
                focus:ring-shop-gold/10
              "
            />

          </div>


          {/* ERROR */}

          {error && (

            <div
              className="
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
              {error}
            </div>

          )}


          {/* SUCCESS */}

          {success && (

            <div
              className="
                rounded-xl
                border
                border-green-200
                bg-green-50
                px-4
                py-3
                text-sm
                text-green-600
              "
            >
              {success}
            </div>

          )}


          {/* BUTTONS */}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                rounded-xl
                border
                border-slate-200
                px-5
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
              disabled={saving}
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-shop-black
                px-6
                py-3
                text-sm
                font-bold
                text-white
                transition
                hover:bg-shop-dark
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {saving && (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              )}

              {saving
                ? "Saving..."
                : editingProduct
                ? "Update Product"
                : "Create Product"}

            </button>

          </div>

        </form>

      </motion.div>

    </motion.div>
  );
}


// =====================================================
// FORM INPUT
// =====================================================

function FormInput({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-shop-text">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="
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
          focus:border-shop-gold
          focus:bg-white
          focus:ring-4
          focus:ring-shop-gold/10
        "
      />

    </div>
  );
}


// =====================================================
// FORM SELECT
// =====================================================

function FormSelect({
  label,
  name,
  value,
  onChange,
  options,
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-semibold text-shop-text">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
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
          focus:border-shop-gold
          focus:ring-4
          focus:ring-shop-gold/10
        "
      >

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}

      </select>

    </div>
  );
}


// =====================================================
// PRODUCT DETAILS
// =====================================================

function ProductDetails({
  product,
  onClose,
}) {
  return (
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
        bg-black/50
        p-4
        backdrop-blur-sm
      "
    >

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.95,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
        exit={{
          opacity: 0,
          scale: 0.95,
        }}
        className="
          w-full
          max-w-lg
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-200
            px-6
            py-5
          "
        >

          <div>

            <p className="text-xs font-bold uppercase tracking-wider text-shop-gold">
              Product Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-shop-text">
              {product.brand} {product.model}
            </h2>

          </div>


          <button
            onClick={onClose}
            className="
              rounded-xl
              p-2
              text-slate-400
              hover:bg-slate-100
              hover:text-shop-black
            "
          >
            <X size={20} />
          </button>

        </div>


        <div className="p-6">

          {/* IMAGE */}

          <div
            className="
              mb-6
              flex
              h-40
              items-center
              justify-center
              overflow-hidden
              rounded-2xl
              bg-shop-black
            "
          >

            {product.image ? (

              <img
                src={product.image}
                alt={product.model}
                className="h-full w-full object-cover"
              />

            ) : (

              <Smartphone
                size={60}
                className="text-shop-gold"
              />

            )}

          </div>


          {/* DETAILS */}

          <div className="grid grid-cols-2 gap-3">

            <Detail
              label="Barcode"
              value={
                product.barcode || "—"
              }
            />

            <Detail
              label="Brand"
              value={product.brand}
            />

            <Detail
              label="Model"
              value={product.model}
            />

            <Detail
              label="Category"
              value={product.category}
            />

            <Detail
              label="Color"
              value={
                product.color || "—"
              }
            />

            <Detail
              label="RAM"
              value={
                product.ram || "—"
              }
            />

            <Detail
              label="Storage"
              value={
                product.storage || "—"
              }
            />

            <Detail
              label="Purchase Price"
              value={`₹${Number(
                product.purchasePrice || 0
              ).toLocaleString(
                "en-IN"
              )}`}
            />

            <Detail
              label="Selling Price"
              value={`₹${Number(
                product.sellingPrice || 0
              ).toLocaleString(
                "en-IN"
              )}`}
            />

            <Detail
              label="Warranty"
              value={
                product.warranty ||
                "No Warranty"
              }
            />

            <Detail
              label="Guarantee"
              value={
                product.guarantee ||
                "No Guarantee"
              }
            />

          </div>


          {/* DESCRIPTION */}

          {product.description && (

            <div className="mt-5">

              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Description
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.description}
              </p>

            </div>

          )}

        </div>

      </motion.div>

    </motion.div>
  );
}


// =====================================================
// DETAIL
// =====================================================

function Detail({
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">

      <p className="text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-shop-text">
        {value}
      </p>

    </div>
  );
}


export default Products;