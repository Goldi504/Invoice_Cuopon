import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ReceiptText,
  Printer,
  Download,
  RefreshCw,
  ChevronDown,
  FileText,
  UserRound,
  Smartphone,
  MapPin,
  CalendarDays,
  CreditCard,
  Package,
  AlertCircle,
  Search,
  X,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

/* ================= HELPERS ================= */

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const dateLabel = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const idOf = (invoice) =>
  invoice?._id || invoice?.id || invoice?.invoiceId;

const numberOf = (invoice) =>
  invoice?.invoiceNumber ||
  invoice?.invoiceNo ||
  invoice?.number ||
  "Invoice";

const nameOf = (invoice) =>
  invoice?.customer?.name ||
  invoice?.customerName ||
  invoice?.customer?.fullName ||
  "Walk-in Customer";

const phoneOf = (invoice) =>
  invoice?.customer?.mobileNumber ||
  invoice?.customer?.mobile ||
  invoice?.customer?.phone ||
  invoice?.customerPhone ||
  invoice?.mobileNumber ||
  invoice?.phone ||
  "";

const totalOf = (invoice) =>
  Number(
    invoice?.totalAmount ??
      invoice?.finalAmount ??
      invoice?.grandTotal ??
      invoice?.amount ??
      invoice?.sale?.totalAmount ??
      invoice?.sale?.sellingPrice ??
      0
  );

const statusOf = (invoice) => {
  const status = String(
    invoice?.status ||
      invoice?.paymentStatus ||
      invoice?.sale?.paymentStatus ||
      "PENDING"
  ).toUpperCase();

  if (["PAID", "COMPLETED", "SUCCESS"].includes(status)) {
    return "PAID";
  }

  if (["CANCELLED", "VOID"].includes(status)) {
    return "CANCELLED";
  }

  if (["FAILED", "FAILURE"].includes(status)) {
    return "FAILED";
  }

  return "PENDING";
};

const itemsOf = (invoice) => {
  if (Array.isArray(invoice?.items)) return invoice.items;
  if (Array.isArray(invoice?.products)) return invoice.products;
  if (Array.isArray(invoice?.sale?.items)) {
    return invoice.sale.items;
  }

  if (invoice?.product || invoice?.sale?.product) {
    return [
      {
        product: invoice.product || invoice.sale?.product,
        productName:
          invoice.productName || invoice.sale?.productName,
        imei: invoice.imei || invoice.sale?.imei,
        quantity: invoice.quantity || 1,
        price:
          invoice.sellingPrice ||
          invoice.sale?.sellingPrice ||
          totalOf(invoice),
        total: totalOf(invoice),
      },
    ];
  }

  return [];
};

const productName = (item) =>
  item?.productName ||
  item?.product?.model ||
  item?.product?.name ||
  item?.name ||
  "Mobile / Product";

const unitPrice = (item) =>
  Number(
    item?.unitPrice ??
      item?.sellingPrice ??
      item?.price ??
      item?.product?.sellingPrice ??
      0
  );

const lineTotal = (item) =>
  Number(
    item?.total ??
      item?.totalPrice ??
      item?.amount ??
      unitPrice(item) * Number(item?.quantity || 1)
  );

/* ================= ANIMATIONS ================= */

const pageAnimation = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      staggerChildren: 0.09,
    },
  },
};

const itemAnimation = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

/* ================= STATUS BADGE ================= */

function StatusBadge({ status }) {
  const styles = {
    PAID: "bg-emerald-50 text-emerald-700 border-emerald-200",
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    FAILED: "bg-rose-50 text-rose-700 border-rose-200",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const Icon = status === "PAID" ? CheckCircle2 : Clock3;

  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${styles[status] || styles.PENDING}`}
    >
      <Icon size={13} />
      {status}
    </motion.span>
  );
}

/* ================= ANIMATED BUTTON ================= */

function AnimatedButton({
  children,
  onClick,
  variant = "light",
  disabled = false,
  className = "",
}) {
  const variants = {
    light:
      "border border-slate-200 bg-white text-slate-800 hover:border-amber-400 hover:bg-amber-50",
    gold:
      "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/20 hover:bg-amber-300",
    dark:
      "bg-slate-950 text-white hover:bg-slate-800",
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { y: -3, scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

/* ================= INVOICE DOCUMENT ================= */

function InvoiceDocument({ invoice }) {
  const items = itemsOf(invoice);

  const date =
    invoice?.createdAt ||
    invoice?.invoiceDate ||
    invoice?.date;

  const paymentMethod =
    invoice?.paymentMethod ||
    invoice?.sale?.paymentMethod ||
    "CASH";

  const address =
    invoice?.customer?.address ||
    invoice?.customerAddress ||
    invoice?.address ||
    "";

  const email =
    invoice?.customer?.email ||
    invoice?.customerEmail ||
    "";

  const subtotal = Number(
    invoice?.subtotal ??
      invoice?.subTotal ??
      invoice?.sale?.subtotal ??
      items.reduce((sum, item) => sum + lineTotal(item), 0)
  );

  const discount = Number(
    invoice?.discount ??
      invoice?.sale?.discount ??
      0
  );

  return (
    <article className="invoice-sheet relative overflow-hidden bg-white p-5 text-slate-900 sm:p-8 lg:p-10">
      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-100/40 blur-3xl" />

      {/* Shop heading */}
      <div className="relative flex flex-col justify-between gap-6 border-b-2 border-slate-900 pb-6 sm:flex-row sm:items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start gap-3"
        >
          <motion.div
            whileHover={{ rotateY: 180, scale: 1.08 }}
            transition={{ duration: 0.45 }}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-amber-500 text-slate-950 shadow-lg shadow-amber-300/30"
          >
            <ReceiptText size={27} />
          </motion.div>

          <div>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              Ganesh Mobile Shop
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Mobile Shop Management System
            </p>

            <p className="mt-4 text-sm text-slate-600">
              Bhopal, Madhya Pradesh
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Thank you for shopping with us!
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, rotateY: 12, x: 20 }}
          animate={{ opacity: 1, rotateY: 0, x: 0 }}
          transition={{ duration: 0.6 }}
          whileHover={{
            rotateX: 2,
            rotateY: -2,
            y: -3,
          }}
          style={{ transformPerspective: 900 }}
          className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:min-w-64"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Invoice No.
            </p>
            <p className="mt-1 break-all text-sm font-extrabold">
              {numberOf(invoice)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Date
            </p>
            <p className="mt-1 text-sm font-semibold">
              {dateLabel(date)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Payment
            </p>
            <p className="mt-1 text-sm font-semibold">
              {String(paymentMethod).replaceAll("_", " ")}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Status
            </p>
            <div className="mt-1">
              <StatusBadge status={statusOf(invoice)} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Customer details */}
      <div className="relative grid grid-cols-1 gap-6 border-b border-slate-200 py-6 sm:grid-cols-2">
        <motion.section
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -2 }}
          className="rounded-xl border border-slate-100 p-3 transition hover:border-amber-200 hover:shadow-md"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Bill To
          </p>

          <div className="mt-3 flex items-start gap-3">
            <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
              <UserRound size={19} />
            </div>

            <div className="min-w-0">
              <p className="break-words font-bold">
                {nameOf(invoice)}
              </p>

              {phoneOf(invoice) && (
                <p className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <Smartphone size={13} />
                  {phoneOf(invoice)}
                </p>
              )}

              {email && (
                <p className="mt-1 break-all text-xs text-slate-500">
                  {email}
                </p>
              )}

              {address && (
                <p className="mt-2 flex items-start gap-2 text-xs text-slate-500">
                  <MapPin size={13} className="mt-0.5 shrink-0" />
                  {address}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={itemAnimation}
          initial="hidden"
          animate="visible"
          whileHover={{ y: -2 }}
          className="rounded-xl border border-slate-100 p-3 transition hover:border-amber-200 hover:shadow-md sm:text-right"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
            Invoice Summary
          </p>

          <div className="mt-3 space-y-3 text-xs text-slate-500">
            <p className="flex items-center gap-2 sm:justify-end">
              <CalendarDays size={14} />
              Invoice date:
              <span className="font-semibold text-slate-800">
                {dateLabel(date)}
              </span>
            </p>

            <p className="flex items-center gap-2 sm:justify-end">
              <CreditCard size={14} />
              Payment method:
              <span className="font-semibold text-slate-800">
                {String(paymentMethod).replaceAll("_", " ")}
              </span>
            </p>

            {invoice?.transactionId && (
              <p className="break-all">
                Transaction ID: {invoice.transactionId}
              </p>
            )}
          </div>
        </motion.section>
      </div>

      {/* Product table */}
      <section className="relative pt-6">
        <div className="mb-4 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, -8, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
            className="rounded-lg bg-amber-50 p-2 text-amber-700"
          >
            <Package size={17} />
          </motion.div>

          <h3 className="text-sm font-bold">Product Details</h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-slate-950 text-white">
              <tr>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">IMEI / Serial No.</th>
                <th className="px-3 py-3 text-center">Qty</th>
                <th className="px-3 py-3 text-right">Price</th>
                <th className="px-3 py-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              <AnimatePresence mode="popLayout">
                {items.length ? (
                  items.map((item, index) => (
                    <motion.tr
                      layout
                      key={item?._id || `${productName(item)}-${index}`}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 18 }}
                      transition={{
                        duration: 0.35,
                        delay: Math.min(index * 0.06, 0.3),
                      }}
                      whileHover={{
                        backgroundColor: "#fffbeb",
                        scale: 1.003,
                      }}
                    >
                      <td className="px-3 py-4 text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        {productName(item)}
                      </td>

                      <td className="px-3 py-4 text-slate-500">
                        {item?.imei ||
                          item?.serialNumber ||
                          item?.serial ||
                          "—"}
                      </td>

                      <td className="px-3 py-4 text-center">
                        {item?.quantity || 1}
                      </td>

                      <td className="px-3 py-4 text-right">
                        {money(unitPrice(item))}
                      </td>

                      <td className="px-3 py-4 text-right font-bold">
                        {money(lineTotal(item))}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td
                      colSpan={6}
                      className="px-3 py-10 text-center text-slate-500"
                    >
                      No product details available for this invoice.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>

      {/* Totals */}
      <section className="relative mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-xs text-xs leading-5 text-slate-500">
          <p className="font-bold text-slate-800">
            Thank you for your purchase!
          </p>

          <p className="mt-1">
            Keep this invoice for your warranty and service records.
          </p>

          <p className="mt-3">
            Computer-generated invoice. No signature required.
          </p>
        </div>

        <motion.div
          key={`${idOf(invoice)}-${totalOf(invoice)}`}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          className="w-full space-y-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-amber-50/50 p-5 shadow-sm sm:max-w-xs"
        >
          <div className="flex justify-between gap-4 text-sm text-slate-500">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>

          <div className="flex justify-between gap-4 text-sm text-slate-500">
            <span>Discount</span>
            <span>{money(discount)}</span>
          </div>

          {invoice?.taxAmount != null && (
            <div className="flex justify-between gap-4 text-sm text-slate-500">
              <span>Tax</span>
              <span>{money(invoice.taxAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t-2 border-slate-900 pt-4">
            <span className="font-bold">Total Amount</span>
            <motion.span
              key={totalOf(invoice)}
              initial={{ scale: 1.2, color: "#d97706" }}
              animate={{ scale: 1, color: "#0f172a" }}
              className="text-xl font-black"
            >
              {money(totalOf(invoice))}
            </motion.span>
          </div>
        </motion.div>
      </section>

      <footer className="relative mt-8 border-t border-dashed border-slate-300 pt-4 text-center text-[10px] text-slate-400">
        GANESH MOBILE SHOP · Bhopal, Madhya Pradesh
      </footer>
    </article>
  );
}

/* ================= MAIN PAGE ================= */

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [downloading, setDownloading] = useState(false);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices");
      const data = response.data;

      const records = Array.isArray(data)
        ? data
        : data?.invoices ||
          data?.data?.invoices ||
          data?.data ||
          [];

      if (!Array.isArray(records)) {
        throw new Error("Unexpected response from the invoice API.");
      }

      setInvoices(records);

      setSelected((current) => {
        if (!records.length) return null;

        const currentId = idOf(current);

        return (
          records.find((item) => idOf(item) === currentId) ||
          records[0]
        );
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load invoices."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const visibleInvoices = useMemo(() => {
    const query = invoiceSearch.trim().toLowerCase();

    if (!query) return invoices;

    return invoices.filter((invoice) =>
      [
        numberOf(invoice),
        nameOf(invoice),
        phoneOf(invoice),
      ].some((value) =>
        String(value).toLowerCase().includes(query)
      )
    );
  }, [invoices, invoiceSearch]);

  const chooseInvoice = async (invoice) => {
    setSelected(invoice);
    setSelectorOpen(false);

    const id = idOf(invoice);
    if (!id) return;

    try {
      setDetailsLoading(true);

      const response = await api.get(`/invoices/${id}`);
      const data = response.data;

      const details =
        data?.invoice ||
        data?.data?.invoice ||
        data?.data ||
        data;

      if (details && typeof details === "object") {
        setSelected(details);
      }
    } catch (err) {
      console.warn(
        "Could not load invoice details:",
        err.response?.data || err.message
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!selected) return;

    const id = idOf(selected);

    if (!id) {
      window.print();
      return;
    }

    try {
      setDownloading(true);

      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${numberOf(selected)}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(
        "PDF download failed:",
        err.response?.data || err.message
      );

      window.alert(
        "Backend PDF download is unavailable. Use Print and choose Save as PDF."
      );
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <Sidebar />

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[250px] lg:px-8">
        <motion.div
          variants={pageAnimation}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[1180px] space-y-6"
        >
          {/* Page heading */}
          <motion.header
            variants={itemAnimation}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                <Sparkles size={14} />
                Sales Management
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                Invoice Details
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Manage, preview, print, and download customer invoices.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatedButton onClick={loadInvoices} disabled={loading}>
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </AnimatedButton>

              <AnimatedButton
                variant="gold"
                onClick={() => {
                  window.location.href = "/sales";
                }}
              >
                <ReceiptText size={16} />
                Create Sale
                <ArrowUpRight size={15} />
              </AnimatedButton>
            </div>
          </motion.header>

          {/* Invoice controls */}
          <motion.section
            variants={itemAnimation}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-bold">
                  Selected Invoice
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {selected
                    ? `${numberOf(selected)} · ${nameOf(selected)}`
                    : "Choose an invoice to preview its details."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="relative">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setSelectorOpen((open) => !open)
                    }
                    disabled={!invoices.length}
                    className="inline-flex min-w-44 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold hover:border-amber-400 disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={16} />
                      {selected
                        ? numberOf(selected)
                        : "Select invoice"}
                    </span>

                    <motion.span
                      animate={{ rotate: selectorOpen ? 180 : 0 }}
                    >
                      <ChevronDown size={15} />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {selectorOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 z-30 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
                      >
                        <div className="border-b border-slate-100 p-3">
                          <div className="relative">
                            <Search
                              size={15}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                              value={invoiceSearch}
                              onChange={(event) =>
                                setInvoiceSearch(event.target.value)
                              }
                              placeholder="Search invoice or customer..."
                              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-1">
                          {visibleInvoices.map((invoice) => (
                            <motion.button
                              key={
                                idOf(invoice) || numberOf(invoice)
                              }
                              type="button"
                              whileHover={{ x: 3 }}
                              onClick={() => chooseInvoice(invoice)}
                              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left ${
                                idOf(invoice) === idOf(selected)
                                  ? "bg-amber-50"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-semibold">
                                  {numberOf(invoice)}
                                </span>

                                <span className="mt-1 block truncate text-xs text-slate-500">
                                  {nameOf(invoice)}
                                </span>
                              </span>

                              <span className="shrink-0 text-xs font-bold">
                                {money(totalOf(invoice))}
                              </span>
                            </motion.button>
                          ))}

                          {visibleInvoices.length === 0 && (
                            <p className="p-4 text-center text-xs text-slate-500">
                              No matching invoices.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatedButton
                  onClick={() => window.print()}
                  disabled={!selected}
                >
                  <Printer size={16} />
                  Print
                </AnimatedButton>

                <AnimatedButton
                  variant="dark"
                  onClick={downloadPDF}
                  disabled={!selected || downloading}
                >
                  <Download size={16} />
                  {downloading ? "Downloading..." : "Download PDF"}
                </AnimatedButton>
              </div>
            </div>
          </motion.section>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
              >
                <AlertCircle size={18} className="shrink-0" />

                <div>
                  <p className="font-bold">Unable to load invoices</p>
                  <p className="mt-1">{error}</p>
                </div>

                <button
                  type="button"
                  onClick={loadInvoices}
                  className="ml-auto font-semibold underline"
                >
                  Retry
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Invoice document */}
          <motion.section
            variants={itemAnimation}
            whileHover={{
              y: -2,
              boxShadow: "0 24px 60px rgba(15,23,42,0.08)",
            }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {loading ? (
              <div className="space-y-5 p-8">
                <div className="h-10 w-64 animate-pulse rounded-lg bg-slate-100" />
                <div className="h-24 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-20 animate-pulse rounded-xl bg-slate-100" />
              </div>
            ) : selected ? (
              <>
                {detailsLoading && (
                  <div className="flex items-center gap-2 border-b border-slate-100 px-6 py-3 text-xs text-slate-500">
                    <RefreshCw size={14} className="animate-spin" />
                    Loading invoice details...
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={idOf(selected) || numberOf(selected)}
                    initial={{ opacity: 0, y: 16, rotateX: 2 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                    style={{ transformPerspective: 1200 }}
                  >
                    <InvoiceDocument invoice={selected} />
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-[380px] flex-col items-center justify-center px-6 py-12 text-center"
              >
                <motion.div
                  animate={{ y: [0, -7, 0], rotate: [0, 3, -3, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="rounded-2xl bg-amber-50 p-5 text-amber-700"
                >
                  <FileText size={34} />
                </motion.div>

                <h2 className="mt-5 text-xl font-bold">
                  No invoice available
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Create a sale first. When your backend returns invoice
                  records, you can select one here and preview its details.
                </p>

                <AnimatedButton
                  variant="gold"
                  onClick={() => {
                    window.location.href = "/sales";
                  }}
                  className="mt-5"
                >
                  <ReceiptText size={16} />
                  Create Sale
                </AnimatedButton>
              </motion.div>
            )}

            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-3 text-xs text-slate-400 sm:flex-row">
              <span>
                {selected
                  ? `Invoice ${numberOf(selected)}`
                  : "Invoice preview"}
              </span>

              <span>
                {invoices.length} invoice record
                {invoices.length === 1 ? "" : "s"} available
              </span>
            </div>
          </motion.section>
        </motion.div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body {
            background: white !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          body * {
            visibility: hidden !important;
          }

          .invoice-sheet,
          .invoice-sheet * {
            visibility: visible !important;
          }

          .invoice-sheet {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            box-shadow: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}