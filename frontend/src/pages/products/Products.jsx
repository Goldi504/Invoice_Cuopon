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

const INITIAL_FORM = {
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
};

function Products() {
  // PRODUCT STATE
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scanning, setScanning] = useState(false);

  // ALERT STATE
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // SEARCH AND FILTER
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  // MODALS
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // SELECTED PRODUCTS
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  // FORM
  const [form, setForm] = useState({ ...INITIAL_FORM });

  // LOGGED-IN USER
  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const isAdmin = user?.role === "ADMIN";

  // LOAD PRODUCTS
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getProducts();

      if (data?.success) {
        setProducts(data.products || []);
      } else {
        setError(data?.message || "Failed to load products.");
      }
    } catch (err) {
      console.error("Products Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load products."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // SEARCH AND CATEGORY FILTER
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
        category === "ALL" || product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  // RESET FORM
  const resetForm = () => {
    setForm({ ...INITIAL_FORM });
  };

  // HANDLE FORM INPUT
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // OPEN ADD PRODUCT MODAL
  const openAddModal = () => {
    setEditingProduct(null);
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // OPEN EDIT PRODUCT MODAL
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
      warranty: product.warranty || "No Warranty",
      guarantee: product.guarantee || "No Guarantee",
      description: product.description || "",
      image: product.image || "",
    });

    setError("");
    setSuccess("");
    setShowModal(true);
  };

  // BARCODE SCANNING
  const handleBarcodeScan = async (scanResult) => {
    try {
      setShowScanner(false);
      setScanning(true);
      setError("");
      setSuccess("");

      const barcode =
        typeof scanResult === "string"
          ? scanResult
          : scanResult?.barcode || "";

      const ocrText =
        typeof scanResult === "string"
          ? ""
          : scanResult?.ocrText || "";

      const data = await scanProductBarcode(barcode, ocrText);

      if (data?.success && data?.found && data?.product) {
        const product = data.product;

        setForm({
          barcode: product.barcode || barcode,
          brand: product.brand || "",
          model: product.model || "",
          category: product.category || "MOBILE",
          ram: product.ram || "",
          storage: product.storage || "",
          color: product.color || "",
          purchasePrice: product.purchasePrice ?? "",
          sellingPrice: product.sellingPrice ?? "",
          warranty: product.warranty || "No Warranty",
          guarantee: product.guarantee || "No Guarantee",
          description: product.description || "",
          image: product.image || "",
        });

        setSuccess(
          data.message || "Product details detected automatically."
        );

        setShowModal(true);
        return;
      }

      // USE PARTIAL OCR INFORMATION WHEN AVAILABLE
      setForm((prev) => ({
        ...prev,
        barcode: barcode || prev.barcode,
        brand: data?.product?.brand || prev.brand,
        model: data?.product?.model || prev.model,
        category: data?.product?.category || prev.category,
        ram: data?.product?.ram || prev.ram,
        storage: data?.product?.storage || prev.storage,
        color: data?.product?.color || prev.color,
        description:
          data?.product?.description || prev.description,
        image: data?.product?.image || prev.image,
      }));

      setShowModal(true);

      setSuccess(
        data?.message ||
          "Information detected. Verify the details and enter prices."
      );
    } catch (err) {
      console.error("Product Scan Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to process product scan."
      );

      setShowModal(true);
    } finally {
      setScanning(false);
    }
  };

  // SAVE PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

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

    const purchasePrice = Number(form.purchasePrice);
    const sellingPrice = Number(form.sellingPrice);

    if (
      !Number.isFinite(purchasePrice) ||
      !Number.isFinite(sellingPrice) ||
      purchasePrice < 0 ||
      sellingPrice < 0
    ) {
      setError("Enter valid prices. Prices cannot be negative.");
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
        purchasePrice,
        sellingPrice,
        warranty: form.warranty.trim(),
        guarantee: form.guarantee.trim(),
        description: form.description.trim(),
        image: form.image.trim(),
      };

      if (editingProduct) {
        const data = await updateProduct(
          editingProduct._id,
          productData
        );

        if (!data?.success) {
          throw new Error(
            data?.message || "Failed to update product."
          );
        }

        setSuccess("Product updated successfully.");
      } else {
        const data = await createProduct(productData);

        if (!data?.success) {
          throw new Error(
            data?.message || "Failed to create product."
          );
        }

        setSuccess("Product created successfully.");
      }

      await loadProducts();

      setTimeout(() => {
        setShowModal(false);
        setSuccess("");
      }, 700);
    } catch (err) {
      console.error("Save Product Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE PRODUCT
  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${product.brand} ${product.model}?`
    );

    if (!confirmed) return;

    try {
      setError("");

      const data = await deleteProduct(product._id);

      if (!data?.success) {
        throw new Error(
          data?.message || "Failed to delete product."
        );
      }

      setSuccess("Product deleted successfully.");

      await loadProducts();

      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Delete Product Error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product."
      );
    }
  };

  // OPEN PRODUCT DETAILS
  const openDetails = (product) => {
    setSelectedProduct(product);
    setShowDetails(true);
  };

  // DASHBOARD STATISTICS
  const totalProducts = products.length;

  const mobileCount = products.filter(
    (product) => product.category === "MOBILE"
  ).length;

  const accessoryCount = products.filter(
    (product) => product.category === "ACCESSORY"
  ).length;

  const averageSellingPrice =
    products.length > 0
      ? products.reduce(
          (sum, product) =>
            sum + Number(product.sellingPrice || 0),
          0
        ) / products.length
      : 0;

  // PART 2 CONTINUES WITH THE PAGE UI
    return (
    <div className="min-h-screen bg-[#F4F0E6] p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E8D39A] bg-[#FFF5D9] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#805A08]">
            <span className="h-2 w-2 rounded-full bg-[#F2C14E]" />
            Shop Management
          </span>

          <h1 className="text-3xl font-bold tracking-tight text-[#171717]">
            Products
          </h1>

          <p className="mt-1 text-sm text-[#766F61]">
            Manage your mobile shop products
          </p>
        </div>

        {isAdmin && (
          <motion.button
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#F2C14E] px-5 py-3 text-sm font-bold text-[#171717] shadow-sm transition-colors duration-200 hover:bg-[#E8B638] hover:shadow-md"
          >
            <Plus size={19} />
            Add Product
          </motion.button>
        )}
      </div>

      {/* ALERTS */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="product-error"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            <AlertCircle size={18} className="shrink-0" />
            <span className="flex-1">{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="rounded-md p-1 transition hover:bg-red-100"
            >
              <X size={17} />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="product-success"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATISTICS */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<Package size={21} strokeWidth={1.8} />}
          title="Total Products"
          value={totalProducts}
          iconColor="gold"
        />

        <StatCard
          icon={<Smartphone size={21} strokeWidth={1.8} />}
          title="Mobile Phones"
          value={mobileCount}
          iconColor="green"
        />

        <StatCard
          icon={<Package size={21} strokeWidth={1.8} />}
          title="Accessories"
          value={accessoryCount}
          iconColor="orange"
        />

        <StatCard
          icon={<IndianRupee size={21} strokeWidth={1.8} />}
          title="Avg. Selling Price"
          value={`₹${averageSellingPrice.toLocaleString("en-IN", {
            maximumFractionDigits: 0,
          })}`}
          iconColor="red"
        />
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="mb-6 rounded-2xl border border-[#E9DCC2] bg-[#FFFEFA] p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              strokeWidth={1.8}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9A8968]"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by barcode, brand, model, category..."
              className="h-12 w-full rounded-xl border border-[#E9DCC2] bg-[#F8F5ED] pl-11 pr-4 text-sm text-[#29251E] outline-none transition duration-200 placeholder:text-[#9A907E] focus:border-[#D9AD36] focus:bg-white focus:ring-4 focus:ring-[#F2C14E]/15"
            />
          </div>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
            className="h-12 rounded-xl border border-[#E9DCC2] bg-[#F8F5ED] px-4 text-sm text-[#5E574B] outline-none transition duration-200 focus:border-[#D9AD36] focus:ring-4 focus:ring-[#F2C14E]/15"
          >
            <option value="ALL">All Categories</option>
            <option value="MOBILE">Mobile</option>
            <option value="ACCESSORY">Accessory</option>
          </select>

          <button
            type="button"
            onClick={loadProducts}
            disabled={loading}
            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#E9DCC2] bg-[#FFFEFA] px-4 text-sm font-semibold text-[#766F61] transition duration-200 hover:border-[#D9AD36] hover:bg-[#FFF8E8] hover:text-[#805A08] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin text-[#C18B13]" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* PRODUCT TABLE */}
      <div className="overflow-hidden rounded-2xl border border-[#E9DCC2] bg-[#FFFEFA] shadow-sm">
        {loading ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center gap-3">
            <Loader2
              size={32}
              className="animate-spin text-[#C18B13]"
            />

            <p className="text-sm text-[#766F61]">
              Loading products...
            </p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF1C7] text-[#A87500]">
              <Package size={30} strokeWidth={1.7} />
            </div>

            <h3 className="text-lg font-bold text-[#171717]">
              No products found
            </h3>

            <p className="mt-1 max-w-sm text-sm text-[#766F61]">
              {search || category !== "ALL"
                ? "Try changing your search or category filter."
                : "Add your first product to get started."}
            </p>

            {isAdmin && !search && category === "ALL" && (
              <button
                type="button"
                onClick={openAddModal}
                className="mt-5 flex items-center gap-2 rounded-xl bg-[#F2C14E] px-4 py-2.5 text-sm font-semibold text-[#171717] transition-colors duration-200 hover:bg-[#E8B638]"
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
                <tr className="border-b border-[#E9DCC2] bg-[#F8F3E8]">
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#766F61]">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#766F61]">
                    Barcode
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#766F61]">
                    Category
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#766F61]">
                    Specifications
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#766F61]">
                    Purchase
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#766F61]">
                    Selling
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#766F61]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: Math.min(index * 0.02, 0.2),
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className="border-b border-[#F0E8D8] transition-colors duration-200 hover:bg-[#FFF8E8]"
                  >
                    {/* PRODUCT */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#FFF1C7] text-[#A87500]">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.model || "Product"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Smartphone
                              size={21}
                              strokeWidth={1.8}
                            />
                          )}
                        </div>

                        <div>
                          <p className="font-bold text-[#171717]">
                            {product.brand}
                          </p>

                          <p className="text-sm text-[#766F61]">
                            {product.model}
                          </p>

                          {product.color && (
                            <p className="mt-0.5 text-xs text-[#9A907E]">
                              {product.color}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* BARCODE */}
                    <td className="px-6 py-5">
                      {product.barcode ? (
                        <span className="rounded-lg border border-[#E9DCC2] bg-[#F8F3E8] px-3 py-1.5 font-mono text-xs font-semibold text-[#5E574B]">
                          {product.barcode}
                        </span>
                      ) : (
                        <span className="text-[#9A907E]">—</span>
                      )}
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-5">
                      <span className="rounded-full border border-[#E8D39A] bg-[#FFF5D9] px-3 py-1.5 text-xs font-bold text-[#805A08]">
                        {product.category}
                      </span>
                    </td>

                    {/* SPECIFICATIONS */}
                    <td className="px-6 py-5">
                      <div className="space-y-1 text-sm text-[#5E574B]">
                        {product.ram && (
                          <div className="flex items-center gap-2">
                            <Cpu
                              size={14}
                              className="text-[#A87500]"
                            />
                            {product.ram} RAM
                          </div>
                        )}

                        {product.storage && (
                          <div className="flex items-center gap-2">
                            <HardDrive
                              size={14}
                              className="text-[#A87500]"
                            />
                            {product.storage}
                          </div>
                        )}

                        {!product.ram && !product.storage && (
                          <span className="text-[#9A907E]">—</span>
                        )}
                      </div>
                    </td>

                    {/* PURCHASE PRICE */}
                    <td className="px-6 py-5">
                      <span className="font-semibold text-[#5E574B]">
                        ₹
                        {Number(
                          product.purchasePrice || 0
                        ).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* SELLING PRICE */}
                    <td className="px-6 py-5">
                      <span className="font-bold text-[#171717]">
                        ₹
                        {Number(
                          product.sellingPrice || 0
                        ).toLocaleString("en-IN")}
                      </span>
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        <ActionButton
                          icon={<Eye size={16} />}
                          label="View"
                          onClick={() => openDetails(product)}
                        />

                        {isAdmin && (
                          <>
                            <ActionButton
                              icon={<Pencil size={16} />}
                              label="Edit"
                              onClick={() => openEditModal(product)}
                            />

                            <ActionButton
                              danger
                              icon={<Trash2 size={16} />}
                              label="Delete"
                              onClick={() => handleDelete(product)}
                            />
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
            {/* ADD / EDIT PRODUCT MODAL */}
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
            onScanClick={() => setShowScanner(true)}
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

      {/* BARCODE SCANNER */}
      <AnimatePresence>
        {showScanner && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setShowScanner(false)}
          />
        )}
      </AnimatePresence>

      {/* PRODUCT DETAILS */}
      <AnimatePresence>
        {showDetails && selectedProduct && (
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
// STATISTICS CARD
// =====================================================

function StatCard({
  icon,
  title,
  value,
  iconColor = "gold",
}) {
  const iconStyles = {
    gold: "bg-[#FFF1C7] text-[#A87500]",
    green: "bg-[#E1F4E9] text-[#07804B]",
    orange: "bg-[#FFF0DB] text-[#B96A08]",
    red: "bg-[#FCE7E5] text-[#D92D20]",
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="rounded-2xl border border-[#E9DCC2] bg-[#FFFEFA] p-5 shadow-sm transition-shadow duration-200 hover:border-[#E8C66A] hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl ${
            iconStyles[iconColor] || iconStyles.gold
          }`}
        >
          {icon}
        </div>

        <span className="text-xs font-medium text-[#96866B]">
          Ganesh Shop
        </span>
      </div>

      <p className="mt-5 text-sm text-[#766F61]">{title}</p>

      <p className="mt-1 text-2xl font-bold text-[#171717]">
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
    <motion.button
      type="button"
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors duration-200 ${
        danger
          ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
          : "border-[#E9DCC2] bg-[#FFFEFA] text-[#766F61] hover:border-[#D9AD36] hover:bg-[#FFF5D9] hover:text-[#805A08]"
      }`}
    >
      {icon}
    </motion.button>
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-[#E9DCC2] bg-[#FFFEFA] shadow-2xl"
      >
        {/* MODAL HEADER */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E9DCC2] bg-[#FFFEFA] px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-[#171717]">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>

            <p className="mt-1 text-sm text-[#766F61]">
              {editingProduct
                ? "Update product information"
                : "Add a new product to your catalog"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close modal"
            className="rounded-xl p-2 text-[#96866B] transition-colors duration-200 hover:bg-[#FFF5D9] hover:text-[#805A08] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* PRODUCT FORM */}
        <form onSubmit={handleSubmit} className="space-y-6 p-5 sm:p-6">
          {/* SCAN PRODUCT */}
          {!editingProduct && (
            <div className="rounded-2xl border border-[#E8D39A] bg-[#FBF5E8] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ScanLine
                      size={20}
                      className="text-[#A87500]"
                    />

                    <h3 className="text-base font-bold text-[#171717]">
                      Scan Product
                    </h3>
                  </div>

                  <p className="mt-1 text-sm text-[#766F61]">
                    Scan a barcode to look up product information.
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onScanClick}
                  disabled={scanning || saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#F2C14E] px-5 py-3 text-sm font-bold text-[#171717] transition-colors duration-200 hover:bg-[#E8B638] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {scanning ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <ScanLine size={18} />
                  )}

                  {scanning ? "Scanning..." : "Scan Product"}
                </motion.button>
              </div>

              {form.barcode && (
                <div className="mt-4 rounded-xl border border-[#E9DCC2] bg-[#FFFEFA] px-4 py-3">
                  <p className="text-xs font-medium text-[#96866B]">
                    Scanned Barcode
                  </p>

                  <p className="mt-1 font-mono text-sm font-bold text-[#171717]">
                    {form.barcode}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* BASIC INFORMATION */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#805A08]">
              Basic Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormInput
                label="Brand *"
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="e.g. Samsung"
              />

              <FormInput
                label="Model *"
                name="model"
                value={form.model}
                onChange={handleChange}
                placeholder="e.g. Galaxy S25"
              />

              <FormSelect
                label="Category"
                name="category"
                value={form.category}
                onChange={handleChange}
                options={[
                  { value: "MOBILE", label: "Mobile" },
                  { value: "ACCESSORY", label: "Accessory" },
                ]}
              />

              <FormInput
                label="Color"
                name="color"
                value={form.color}
                onChange={handleChange}
                placeholder="e.g. Black"
              />

              <FormInput
                label="Barcode"
                name="barcode"
                value={form.barcode}
                onChange={handleChange}
                placeholder="Enter barcode"
              />
            </div>
          </div>

          {/* SPECIFICATIONS */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#805A08]">
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

          {/* PRICING */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#805A08]">
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
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-[#805A08]">
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

          {/* IMAGE URL */}
          <FormInput
            label="Image URL"
            name="image"
            value={form.image}
            onChange={handleChange}
            placeholder="https://example.com/product.jpg"
          />

          {/* DESCRIPTION */}
          <div>
            <label
              htmlFor="product-description"
              className="mb-2 block text-sm font-semibold text-[#5E574B]"
            >
              Description
            </label>

            <textarea
              id="product-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Enter product description..."
              className="w-full rounded-xl border border-[#E9DCC2] bg-[#F8F5ED] px-4 py-3 text-sm text-[#29251E] outline-none transition duration-200 placeholder:text-[#9A907E] focus:border-[#D9AD36] focus:bg-white focus:ring-4 focus:ring-[#F2C14E]/15"
            />
          </div>

          {/* ERROR MESSAGE */}
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS MESSAGE */}
          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              <CheckCircle2
                size={18}
                className="mt-0.5 shrink-0"
              />
              <span>{success}</span>
            </div>
          )}

          {/* FORM BUTTONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-[#F0E8D8] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#E9DCC2] px-5 py-3 text-sm font-semibold text-[#5E574B] transition-colors duration-200 hover:bg-[#F8F3E8] disabled:opacity-50"
            >
              Cancel
            </button>

            <motion.button
              type="submit"
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#F2C14E] px-6 py-3 text-sm font-bold text-[#171717] transition-colors duration-200 hover:bg-[#E8B638] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <Loader2 size={17} className="animate-spin" />
              )}

              {saving
                ? "Saving..."
                : editingProduct
                ? "Update Product"
                : "Create Product"}
            </motion.button>
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
  const inputId = `product-${name}`;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-[#5E574B]"
      >
        {label}
      </label>

      <input
        id={inputId}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className="h-12 w-full rounded-xl border border-[#E9DCC2] bg-[#F8F5ED] px-4 text-sm text-[#29251E] outline-none transition duration-200 placeholder:text-[#9A907E] focus:border-[#D9AD36] focus:bg-white focus:ring-4 focus:ring-[#F2C14E]/15"
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
  const selectId = `product-${name}`;

  return (
    <div>
      <label
        htmlFor={selectId}
        className="mb-2 block text-sm font-semibold text-[#5E574B]"
      >
        {label}
      </label>

      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className="h-12 w-full rounded-xl border border-[#E9DCC2] bg-[#F8F5ED] px-4 text-sm text-[#29251E] outline-none transition duration-200 focus:border-[#D9AD36] focus:ring-4 focus:ring-[#F2C14E]/15"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// =====================================================
// PRODUCT DETAILS MODAL
// =====================================================

function ProductDetails({ product, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 8 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-[#E9DCC2] bg-[#FFFEFA] shadow-2xl"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#E9DCC2] px-6 py-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#A87500]">
              Product Details
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#171717]">
              {product.brand} {product.model}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close product details"
            className="rounded-xl p-2 text-[#96866B] transition-colors duration-200 hover:bg-[#FFF5D9] hover:text-[#805A08]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* PRODUCT IMAGE */}
          <div className="mb-6 flex h-40 items-center justify-center overflow-hidden rounded-2xl border border-[#E9DCC2] bg-[#F8F3E8]">
            {product.image ? (
              <img
                src={product.image}
                alt={`${product.brand} ${product.model}`}
                className="h-full w-full object-contain"
              />
            ) : (
              <Smartphone
                size={56}
                strokeWidth={1.5}
                className="text-[#A87500]"
              />
            )}
          </div>

          {/* PRODUCT INFORMATION */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail
              label="Barcode"
              value={product.barcode || "—"}
            />

            <Detail
              label="Brand"
              value={product.brand || "—"}
            />

            <Detail
              label="Model"
              value={product.model || "—"}
            />

            <Detail
              label="Category"
              value={product.category || "—"}
            />

            <Detail
              label="Color"
              value={product.color || "—"}
            />

            <Detail
              label="RAM"
              value={product.ram || "—"}
            />

            <Detail
              label="Storage"
              value={product.storage || "—"}
            />

            <Detail
              label="Purchase Price"
              value={`₹${Number(
                product.purchasePrice || 0
              ).toLocaleString("en-IN")}`}
            />

            <Detail
              label="Selling Price"
              value={`₹${Number(
                product.sellingPrice || 0
              ).toLocaleString("en-IN")}`}
            />

            <Detail
              label="Warranty"
              value={product.warranty || "No Warranty"}
            />

            <Detail
              label="Guarantee"
              value={product.guarantee || "No Guarantee"}
            />
          </div>

          {/* DESCRIPTION */}
          {product.description && (
            <div className="mt-5 rounded-xl border border-[#E9DCC2] bg-[#F8F5ED] p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-[#96866B]">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#5E574B]">
                {product.description}
              </p>
            </div>
          )}

          {/* CLOSE BUTTON */}
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="mt-6 w-full rounded-xl bg-[#F2C14E] px-5 py-3 text-sm font-bold text-[#171717] transition-colors duration-200 hover:bg-[#E8B638]"
          >
            Close
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// =====================================================
// DETAIL ITEM
// =====================================================

function Detail({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl border border-[#E9DCC2] bg-[#F8F5ED] p-3">
      <p className="text-xs text-[#96866B]">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-[#29251E]">
        {value}
      </p>
    </div>
  );
}

// =====================================================
// EXPORT
// =====================================================

export default Products;