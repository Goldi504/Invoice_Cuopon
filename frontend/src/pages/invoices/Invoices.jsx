
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
  CheckCircle2,
  Clock3,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

// ==================================================
// THEME
// ==================================================

const THEME = {
  page: "#F4F0E6",
  card: "#FFFEFA",
  border: "#E6D9BD",
  text: "#171914",
  muted: "#746D5E",
  gold: "#F4C64E",
  goldDark: "#B8860B",
  hover: "#FFF8E5",
};

// ==================================================
// HELPERS
// ==================================================

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

// ==================================================
// ANIMATIONS
// ==================================================

const pageAnimation = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      staggerChildren: 0.07,
    },
  },
};

const itemAnimation = {
  hidden: {
    opacity: 0,
    y: 14,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};

const spring = {
  type: "spring",
  stiffness: 300,
  damping: 24,
};

// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({ status }) {
  const styles = {
    PAID: "bg-green-50 text-green-700 border-green-200",
    PENDING: "bg-amber-50 text-amber-800 border-amber-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    CANCELLED: "bg-gray-100 text-gray-600 border-gray-200",
  };

  const Icon =
    status === "PAID" ? CheckCircle2 : Clock3;

  return (
    <motion.span
      key={status}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${
        styles[status] || styles.PENDING
      }`}
    >
      <Icon size={13} />
      {status}
    </motion.span>
  );
}

// ==================================================
// ANIMATED BUTTON
// ==================================================

function AnimatedButton({
  children,
  onClick,
  variant = "light",
  disabled = false,
  className = "",
}) {
  const variants = {
    light:
      "border border-[#E6D9BD] bg-[#FFFEFA] text-[#171914] hover:border-[#D4AF37] hover:bg-[#FFF6D9]",
    gold:
      "bg-[#F4C64E] text-black shadow-lg shadow-[#D4AF37]/20 hover:bg-[#E7B83B]",
    dark:
      "bg-[#171914] text-white hover:bg-[#303126]",
  };

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? undefined
          : {
              y: -3,
              scale: 1.02,
            }
      }
      whileTap={
        disabled
          ? undefined
          : {
              scale: 0.96,
            }
      }
      transition={spring}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
        variants[variant]
      } ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ==================================================
// INVOICE DOCUMENT
// ==================================================

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
      items.reduce(
        (sum, item) => sum + lineTotal(item),
        0
      )
  );

  const discount = Number(
    invoice?.discount ??
      invoice?.sale?.discount ??
      0
  );

  return (
    <article className="invoice-sheet relative overflow-hidden bg-white p-5 text-[#171914] sm:p-8 lg:p-10">
      {/* Soft gold decorative background */}

      <div className="pointer-events-none absolute right-0 top-0 h-48 w-48 rounded-full bg-[#FFF6D9]/50 blur-3xl" />

      {/* SHOP HEADING */}

      <div className="relative flex flex-col justify-between gap-6 border-b-2 border-[#171914] pb-6 sm:flex-row sm:items-start">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-3"
        >
          <motion.div
            whileHover={{
              rotate: 5,
              scale: 1.05,
            }}
            transition={spring}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE28A] to-[#F4C64E] text-[#171914] shadow-md"
          >
            <ReceiptText size={27} />
          </motion.div>

          <div>
            <h2 className="text-xl font-black tracking-tight sm:text-2xl">
              Ganesh Mobile Shop
            </h2>

            <p className="mt-1 text-xs text-[#746D5E]">
              Mobile Shop Management System
            </p>

            <p className="mt-4 text-sm text-[#746D5E]">
              Bhopal, Madhya Pradesh
            </p>

            <p className="mt-1 text-xs text-[#746D5E]">
              Thank you for shopping with us!
            </p>
          </div>
        </motion.div>

        {/* INVOICE SUMMARY CARD */}

        <motion.div
          initial={{
            opacity: 0,
            x: 15,
          }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          whileHover={{
            y: -3,
            boxShadow:
              "0 12px 25px rgba(184,134,11,0.10)",
          }}
          transition={spring}
          className="grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-sm sm:min-w-64"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#746D5E]">
              Invoice No.
            </p>

            <p className="mt-1 break-all text-sm font-extrabold">
              {numberOf(invoice)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#746D5E]">
              Date
            </p>

            <p className="mt-1 text-sm font-semibold">
              {dateLabel(date)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#746D5E]">
              Payment
            </p>

            <p className="mt-1 text-sm font-semibold">
              {String(paymentMethod).replaceAll("_", " ")}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#746D5E]">
              Status
            </p>

            <div className="mt-1">
              <StatusBadge status={statusOf(invoice)} />
            </div>
          </div>
        </motion.div>
      </div>

      {/* CUSTOMER DETAILS */}

      <div className="relative grid grid-cols-1 gap-6 border-b border-[#E6D9BD] py-6 sm:grid-cols-2">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            y: -3,
            borderColor: THEME.gold,
          }}
          transition={spring}
          className="rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] p-4"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#746D5E]">
            Bill To
          </p>

          <div className="mt-3 flex items-start gap-3">
            <div className="rounded-xl bg-[#FFF6D9] p-2.5 text-[#9B7613]">
              <UserRound size={19} />
            </div>

            <div className="min-w-0">
              <p className="break-words font-bold">
                {nameOf(invoice)}
              </p>

              {phoneOf(invoice) && (
                <p className="mt-2 flex items-center gap-2 text-xs text-[#746D5E]">
                  <Smartphone size={13} />
                  {phoneOf(invoice)}
                </p>
              )}

              {email && (
                <p className="mt-1 break-all text-xs text-[#746D5E]">
                  {email}
                </p>
              )}

              {address && (
                <p className="mt-2 flex items-start gap-2 text-xs text-[#746D5E]">
                  <MapPin
                    size={13}
                    className="mt-0.5 shrink-0"
                  />
                  {address}
                </p>
              )}
            </div>
          </div>
        </motion.section>

        {/* PAYMENT DETAILS */}

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{
            y: -3,
            borderColor: THEME.gold,
          }}
          transition={spring}
          className="rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 sm:text-right"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#746D5E]">
            Invoice Summary
          </p>

          <div className="mt-3 space-y-3 text-xs text-[#746D5E]">
            <p className="flex items-center gap-2 sm:justify-end">
              <CalendarDays size={14} />
              Invoice date:
              <span className="font-semibold text-[#171914]">
                {dateLabel(date)}
              </span>
            </p>

            <p className="flex items-center gap-2 sm:justify-end">
              <CreditCard size={14} />
              Payment method:
              <span className="font-semibold text-[#171914]">
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

      {/* PRODUCT DETAILS */}

      <section className="relative pt-6">
        <div className="mb-4 flex items-center gap-2">
          <motion.div
            animate={{
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 3,
            }}
            className="rounded-lg bg-[#FFF6D9] p-2 text-[#9B7613]"
          >
            <Package size={17} />
          </motion.div>

          <h3 className="text-sm font-bold">
            Product Details
          </h3>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#E6D9BD]">
          <table className="w-full min-w-[620px] text-left text-xs">
            <thead className="bg-[#171914] text-white">
              <tr>
                <th className="px-3 py-3">#</th>
                <th className="px-3 py-3">Product</th>
                <th className="px-3 py-3">
                  IMEI / Serial No.
                </th>
                <th className="px-3 py-3 text-center">
                  Qty
                </th>
                <th className="px-3 py-3 text-right">
                  Price
                </th>
                <th className="px-3 py-3 text-right">
                  Total
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#EEE5D2]">
              <AnimatePresence mode="popLayout">
                {items.length ? (
                  items.map((item, index) => (
                    <motion.tr
                      layout
                      key={
                        item?._id ||
                        `${productName(item)}-${index}`
                      }
                      initial={{
                        opacity: 0,
                        x: -15,
                      }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        x: 15,
                      }}
                      transition={{
                        duration: 0.3,
                        delay: Math.min(
                          index * 0.05,
                          0.3
                        ),
                      }}
                      whileHover={{
                        backgroundColor: THEME.hover,
                      }}
                    >
                      <td className="px-3 py-4 text-[#746D5E]">
                        {index + 1}
                      </td>

                      <td className="px-3 py-4 font-semibold">
                        {productName(item)}
                      </td>

                      <td className="px-3 py-4 text-[#746D5E]">
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
                      className="px-3 py-10 text-center text-[#746D5E]"
                    >
                      No product details available for this
                      invoice.
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>

      {/* TOTALS */}

      <section className="relative mt-6 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div className="max-w-xs text-xs leading-5 text-[#746D5E]">
          <p className="font-bold text-[#171914]">
            Thank you for your purchase!
          </p>

          <p className="mt-1">
            Keep this invoice for your warranty and
            service records.
          </p>

          <p className="mt-3">
            Computer-generated invoice. No signature
            required.
          </p>
        </div>

        <motion.div
          key={`${idOf(invoice)}-${totalOf(invoice)}`}
          initial={{
            opacity: 0,
            y: 12,
            scale: 0.97,
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
          }}
          whileHover={{
            y: -3,
            boxShadow:
              "0 12px 25px rgba(184,134,11,0.10)",
          }}
          transition={spring}
          className="w-full space-y-3 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-5 shadow-sm sm:max-w-xs"
        >
          <div className="flex justify-between gap-4 text-sm text-[#746D5E]">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>

          <div className="flex justify-between gap-4 text-sm text-[#746D5E]">
            <span>Discount</span>
            <span>{money(discount)}</span>
          </div>

          {invoice?.taxAmount != null && (
            <div className="flex justify-between gap-4 text-sm text-[#746D5E]">
              <span>Tax</span>
              <span>{money(invoice.taxAmount)}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 border-t-2 border-[#171914] pt-4">
            <span className="font-bold">
              Total Amount
            </span>

            <motion.span
              key={totalOf(invoice)}
              initial={{
                scale: 1.15,
                color: "#B8860B",
              }}
              animate={{
                scale: 1,
                color: "#171914",
              }}
              transition={spring}
              className="text-xl font-black"
            >
              {money(totalOf(invoice))}
            </motion.span>
          </div>
        </motion.div>
      </section>

      <footer className="relative mt-8 border-t border-dashed border-[#E6D9BD] pt-4 text-center text-[10px] text-[#948A76]">
        GANESH MOBILE SHOP · Bhopal, Madhya Pradesh
      </footer>
    </article>
  );
}

// ==================================================
// MAIN INVOICES PAGE
// ==================================================

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [selectorOpen, setSelectorOpen] =
    useState(false);

  const [invoiceSearch, setInvoiceSearch] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);

  // LOAD INVOICES

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
        throw new Error(
          "Unexpected response from the invoice API."
        );
      }

      setInvoices(records);

      setSelected((current) => {
        if (!records.length) return null;

        const currentId = idOf(current);

        return (
          records.find(
            (item) => idOf(item) === currentId
          ) || records[0]
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

  // SEARCH INVOICES

  const visibleInvoices = useMemo(() => {
    const query = invoiceSearch
      .trim()
      .toLowerCase();

    if (!query) return invoices;

    return invoices.filter((invoice) =>
      [
        numberOf(invoice),
        nameOf(invoice),
        phoneOf(invoice),
      ].some((value) =>
        String(value)
          .toLowerCase()
          .includes(query)
      )
    );
  }, [invoices, invoiceSearch]);

  // SELECT INVOICE

  const chooseInvoice = async (invoice) => {
    setSelected(invoice);
    setSelectorOpen(false);

    const id = idOf(invoice);

    if (!id) return;

    try {
      setDetailsLoading(true);

      const response = await api.get(
        `/invoices/${id}`
      );

      const data = response.data;

      const details =
        data?.invoice ||
        data?.data?.invoice ||
        data?.data ||
        data;

      if (
        details &&
        typeof details === "object"
      ) {
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

  // DOWNLOAD PDF

  const downloadPDF = async () => {
    if (!selected) return;

    const id = idOf(selected);

    if (!id) {
      window.print();
      return;
    }

    try {
      setDownloading(true);

      const response = await api.get(
        `/invoices/${id}/pdf`,
        {
          responseType: "blob",
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type:
            response.headers["content-type"] ||
            "application/pdf",
        }
      );

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

  // ==================================================
  // PAGE UI
  // ==================================================

  return (
    <div
      className="min-h-screen w-full text-[#171914]"
      style={{
        backgroundColor: THEME.page,
      }}
    >
      <Sidebar />

      <main
        className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[250px] lg:px-8"
        style={{
          backgroundColor: THEME.page,
        }}
      >
        <motion.div
          variants={pageAnimation}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[1600px] space-y-6"
        >
          {/* PAGE HEADING */}

          <motion.header
            variants={itemAnimation}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#B8860B]">
                <Sparkles size={14} />
                Sales Management
              </div>

              <h1 className="text-3xl font-black tracking-tight text-[#171914] sm:text-4xl">
                Invoice Details
              </h1>

              <p className="mt-2 text-sm text-[#746D5E]">
                Manage, preview, print, and download
                customer invoices.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <AnimatedButton
                onClick={loadInvoices}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={
                    loading ? "animate-spin" : ""
                  }
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

          {/* INVOICE CONTROLS */}

          <motion.section
            variants={itemAnimation}
            whileHover={{
              y: -3,
              boxShadow:
                "0 12px 30px rgba(184,134,11,0.08)",
            }}
            transition={spring}
            className="rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-sm font-bold text-[#171914]">
                  Selected Invoice
                </h2>

                <p className="mt-1 text-xs text-[#746D5E]">
                  {selected
                    ? `${numberOf(selected)} · ${nameOf(selected)}`
                    : "Choose an invoice to preview its details."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {/* INVOICE SELECTOR */}

                <div className="relative">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    onClick={() =>
                      setSelectorOpen(
                        (open) => !open
                      )
                    }
                    disabled={!invoices.length}
                    className="inline-flex min-w-44 items-center justify-between gap-3 rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] px-3 py-2.5 text-sm font-semibold text-[#171914] transition hover:border-[#D4AF37] hover:bg-[#FFF8E5] disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={16} />

                      {selected
                        ? numberOf(selected)
                        : "Select invoice"}
                    </span>

                    <motion.span
                      animate={{
                        rotate: selectorOpen
                          ? 180
                          : 0,
                      }}
                      transition={spring}
                    >
                      <ChevronDown size={15} />
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {selectorOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.97,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: 8,
                          scale: 0.97,
                        }}
                        transition={{
                          duration: 0.2,
                        }}
                        className="absolute right-0 z-30 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-xl"
                      >
                        <div className="border-b border-[#EEE5D2] p-3">
                          <div className="relative">
                            <Search
                              size={15}
                              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#948A76]"
                            />

                            <input
                              value={invoiceSearch}
                              onChange={(event) =>
                                setInvoiceSearch(
                                  event.target.value
                                )
                              }
                              placeholder="Search invoice or customer..."
                              className="w-full rounded-lg border border-[#E6D9BD] bg-[#F9F6EE] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#D4AF37]"
                            />
                          </div>
                        </div>

                        <div className="max-h-64 overflow-y-auto p-1">
                          {visibleInvoices.map(
                            (invoice) => (
                              <motion.button
                                key={
                                  idOf(invoice) ||
                                  numberOf(invoice)
                                }
                                type="button"
                                whileHover={{
                                  x: 3,
                                  backgroundColor:
                                    THEME.hover,
                                }}
                                onClick={() =>
                                  chooseInvoice(invoice)
                                }
                                className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left ${
                                  idOf(invoice) ===
                                  idOf(selected)
                                    ? "bg-[#FFF6D9]"
                                    : ""
                                }`}
                              >
                                <span className="min-w-0">
                                  <span className="block truncate text-sm font-semibold">
                                    {numberOf(invoice)}
                                  </span>

                                  <span className="mt-1 block truncate text-xs text-[#746D5E]">
                                    {nameOf(invoice)}
                                  </span>
                                </span>

                                <span className="shrink-0 text-xs font-bold">
                                  {money(
                                    totalOf(invoice)
                                  )}
                                </span>
                              </motion.button>
                            )
                          )}

                          {visibleInvoices.length ===
                            0 && (
                            <p className="p-4 text-center text-xs text-[#746D5E]">
                              No matching invoices.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* PRINT */}

                <AnimatedButton
                  onClick={() =>
                    window.print()
                  }
                  disabled={!selected}
                >
                  <Printer size={16} />
                  Print
                </AnimatedButton>

                {/* DOWNLOAD */}

                <AnimatedButton
                  variant="dark"
                  onClick={downloadPDF}
                  disabled={
                    !selected || downloading
                  }
                >
                  <Download size={16} />

                  {downloading
                    ? "Downloading..."
                    : "Download PDF"}
                </AnimatedButton>
              </div>
            </div>
          </motion.section>

          {/* ERROR MESSAGE */}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{
                  opacity: 0,
                  height: 0,
                }}
                animate={{
                  opacity: 1,
                  height: "auto",
                }}
                exit={{
                  opacity: 0,
                  height: 0,
                }}
                className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                <AlertCircle
                  size={18}
                  className="shrink-0"
                />

                <div>
                  <p className="font-bold">
                    Unable to load invoices
                  </p>

                  <p className="mt-1">
                    {error}
                  </p>
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

          {/* INVOICE PREVIEW */}

          <motion.section
            variants={itemAnimation}
            whileHover={{
              y: -2,
              boxShadow:
                "0 16px 35px rgba(184,134,11,0.08)",
            }}
            transition={spring}
            className="overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-sm"
          >
            {loading ? (
              <div className="space-y-5 p-8">
                <div className="h-10 w-64 animate-pulse rounded-lg bg-[#F4F0E6]" />

                <div className="h-24 animate-pulse rounded-xl bg-[#F4F0E6]" />

                <div className="h-40 animate-pulse rounded-xl bg-[#F4F0E6]" />

                <div className="h-20 animate-pulse rounded-xl bg-[#F4F0E6]" />
              </div>
            ) : selected ? (
              <>
                {detailsLoading && (
                  <div className="flex items-center gap-2 border-b border-[#EEE5D2] px-6 py-3 text-xs text-[#746D5E]">
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                    Loading invoice details...
                  </div>
                )}

                <AnimatePresence mode="wait">
                  <motion.div
                    key={
                      idOf(selected) ||
                      numberOf(selected)
                    }
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.35,
                      ease: "easeOut",
                    }}
                  >
                    <InvoiceDocument
                      invoice={selected}
                    />
                  </motion.div>
                </AnimatePresence>
              </>
            ) : (
              /* EMPTY STATE */

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="flex min-h-[380px] flex-col items-center justify-center px-6 py-12 text-center"
              >
                <motion.div
                  animate={{
                    y: [0, -6, 0],
                    rotate: [0, 3, -3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="rounded-2xl bg-[#FFF6D9] p-5 text-[#9B7613]"
                >
                  <FileText size={34} />
                </motion.div>

                <h2 className="mt-5 text-xl font-bold text-[#171914]">
                  No invoice available
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-[#746D5E]">
                  Create a sale first. When your
                  backend returns invoice records,
                  you can select one here and preview
                  its details.
                </p>

                <AnimatedButton
                  variant="gold"
                  onClick={() => {
                    window.location.href =
                      "/sales";
                  }}
                  className="mt-5"
                >
                  <ReceiptText size={16} />
                  Create Sale
                </AnimatedButton>
              </motion.div>
            )}

            {/* FOOTER */}

            <div className="flex flex-col justify-between gap-2 border-t border-[#EEE5D2] px-5 py-3 text-xs text-[#948A76] sm:flex-row">
              <span>
                {selected
                  ? `Invoice ${numberOf(selected)}`
                  : "Invoice preview"}
              </span>

              <span>
                {invoices.length} invoice record
                {invoices.length === 1
                  ? ""
                  : "s"}{" "}
                available
              </span>
            </div>
          </motion.section>
        </motion.div>
      </main>

      {/* PRINT STYLES */}

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
