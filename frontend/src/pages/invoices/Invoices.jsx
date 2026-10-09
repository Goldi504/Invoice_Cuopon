
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  Eye,
  Printer,
  Download,
  RefreshCw,
  X,
  CalendarDays,
  UserRound,
  IndianRupee,
  ReceiptText,
  AlertCircle,
  CheckCircle2,
  Clock3,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import {
  getInvoices,
  getInvoiceById,
  downloadInvoicePDF,
  printInvoice,
} from "../../services/invoiceService";
import api from "../../services/api";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const formatDate = (value) => {
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

const getInvoiceId = (invoice) =>
  invoice?._id || invoice?.id || invoice?.invoiceId;

const getInvoiceNumber = (invoice) =>
  invoice?.invoiceNumber ||
  invoice?.invoiceNo ||
  invoice?.number ||
  "Invoice";

const getCustomerName = (invoice) =>
  invoice?.customer?.name ||
  invoice?.customerName ||
  "Walk-in Customer";

const getAmount = (invoice) =>
  invoice?.totalAmount ??
  invoice?.finalAmount ??
  invoice?.grandTotal ??
  invoice?.amount ??
  0;

const getStatus = (invoice) => {
  const status = String(
    invoice?.status ||
      invoice?.paymentStatus ||
      invoice?.sale?.paymentStatus ||
      "PENDING"
  ).toUpperCase();

  if (["PAID", "COMPLETED", "SUCCESS"].includes(status)) {
    return "PAID";
  }

  if (["CANCELLED", "VOID", "FAILED"].includes(status)) {
    return status === "CANCELLED" || status === "VOID"
      ? "CANCELLED"
      : "FAILED";
  }

  return "PENDING";
};

const statusStyles = {
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-600/20",
  FAILED: "bg-rose-50 text-rose-700 ring-rose-600/20",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const pageVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

function AnimatedButton({
  children,
  onClick,
  variant = "secondary",
  disabled = false,
  type = "button",
  className = "",
}) {
  const variants = {
    primary:
      "bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:bg-amber-300",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:border-amber-300 hover:text-slate-950",
    dark:
      "bg-slate-950 text-white shadow-lg shadow-slate-950/20 hover:bg-slate-800",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled
          ? {}
          : {
              y: -3,
              rotateX: -4,
              rotateY: 4,
              scale: 1.025,
            }
      }
      whileTap={disabled ? {} : { scale: 0.96, y: 1 }}
      transition={{ type: "spring", stiffness: 350, damping: 18 }}
      style={{ transformStyle: "preserve-3d" }}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
}

function StatCard({ title, value, description, icon: Icon, index }) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -5,
        rotateX: 2,
        rotateY: -2,
        scale: 1.01,
      }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      style={{ transformStyle: "preserve-3d" }}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl hover:shadow-slate-200/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="mt-3 text-2xl font-bold tracking-tight text-slate-950"
          >
            {value}
          </motion.h3>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <motion.div
          whileHover={{ rotate: 8, scale: 1.12, z: 15 }}
          className="rounded-xl bg-amber-50 p-3 text-amber-700"
        >
          <Icon size={21} />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices");

      const data = response.data;
      const records = Array.isArray(data)
        ? data
        : data?.invoices || data?.data?.invoices || data?.data || [];

      if (!Array.isArray(records)) {
        throw new Error(
          "The invoice API returned an unexpected response format."
        );
      }

      setInvoices(records);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load invoices."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesSearch = [
        getInvoiceNumber(invoice),
        getCustomerName(invoice),
        invoice?.customer?.mobileNumber,
        invoice?.customer?.mobile,
        invoice?.paymentMethod,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "ALL" ||
        getStatus(invoice) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const stats = useMemo(() => {
    const paidInvoices = invoices.filter(
      (invoice) => getStatus(invoice) === "PAID"
    );

    const pendingInvoices = invoices.filter(
      (invoice) => getStatus(invoice) === "PENDING"
    );

    return {
      total: invoices.length,
      paid: paidInvoices.length,
      pending: pendingInvoices.length,
      revenue: paidInvoices.reduce(
        (sum, invoice) => sum + Number(getAmount(invoice)),
        0
      ),
    };
  }, [invoices]);

  const openInvoice = async (invoice) => {
    setSelectedInvoice(invoice);

    const id = getInvoiceId(invoice);

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
        setSelectedInvoice(details);
      }
    } catch (err) {
      // Keep the invoice row available if the details endpoint is absent.
      console.error(
        "Unable to load invoice details:",
        err.response?.data || err.message
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const printInvoice = () => {
    window.print();
  };

  const downloadInvoice = async (invoice) => {
    const id = getInvoiceId(invoice);

    if (!id) {
      window.print();
      return;
    }

    try {
      const response = await api.get(`/invoices/${id}/pdf`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `${getInvoiceNumber(invoice)}.pdf`;
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
        "PDF download is not available from the backend yet. Use Print and select Save as PDF."
      );
    }
  };

  const invoiceItems = (invoice) => {
    if (Array.isArray(invoice?.items)) return invoice.items;
    if (Array.isArray(invoice?.products)) return invoice.products;
    if (Array.isArray(invoice?.sale?.items)) return invoice.sale.items;

    if (invoice?.product || invoice?.sale?.product) {
      return [
        {
          product: invoice.product || invoice.sale?.product,
          productName:
            invoice.productName ||
            invoice.sale?.productName ||
            invoice.product?.model ||
            "Mobile / Product",
          imei: invoice.imei || invoice.sale?.imei,
          quantity: invoice.quantity || 1,
          price:
            invoice.sellingPrice ||
            invoice.sale?.sellingPrice ||
            getAmount(invoice),
          total: getAmount(invoice),
        },
      ];
    }

    return [];
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <Sidebar />

      <main className="min-h-screen px-4 py-6 sm:px-6 lg:ml-[250px] lg:px-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[1500px] space-y-7"
        >
          {/* Header */}
          <motion.header
            variants={itemVariants}
            className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          >
            <div>
              {/* <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Sales management
              </div> */}

              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Invoices
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                View, manage, print, and download customer invoices.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AnimatedButton
                onClick={fetchInvoices}
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </AnimatedButton>

              <AnimatedButton
                variant="primary"
                onClick={() => {
                  window.location.href = "/sales";
                }}
              >
                <ReceiptText size={17} />
                Create Sale
                <ArrowUpRight size={15} />
              </AnimatedButton>
            </div>
          </motion.header>

          {/* Statistics */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Invoices"
              value={stats.total}
              description="Invoices returned by the API"
              icon={FileText}
              index={0}
            />

            <StatCard
              title="Paid Invoices"
              value={stats.paid}
              description="Successfully paid invoices"
              icon={CheckCircle2}
              index={1}
            />

            <StatCard
              title="Pending Invoices"
              value={stats.pending}
              description="Awaiting payment"
              icon={Clock3}
              index={2}
            />

            <StatCard
              title="Collected Amount"
              value={formatCurrency(stats.revenue)}
              description="Total from paid invoices"
              icon={IndianRupee}
              index={3}
            />
          </section>

          {/* Invoice table */}
          <motion.section
            variants={itemVariants}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  All Invoices
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search and manage your sales records.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search invoice or customer..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100 sm:w-72"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
                >
                  <option value="ALL">All Status</option>
                  <option value="PAID">Paid</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="m-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">Unable to load invoices</p>
                  <p className="mt-1">{error}</p>
                </div>
                <button
                  onClick={fetchInvoices}
                  className="font-semibold underline"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50/80">
                  <tr className="text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4 font-semibold">Invoice No.</th>
                    <th className="px-5 py-4 font-semibold">Customer</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                    <th className="px-5 py-4 font-semibold">Amount</th>
                    <th className="px-5 py-4 font-semibold">Payment</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 6 }).map((__, cell) => (
                          <td key={cell} className="px-5 py-5">
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="rounded-2xl bg-amber-50 p-4 text-amber-700">
                            <FileText size={28} />
                          </div>

                          <h3 className="mt-4 font-semibold text-slate-900">
                            No invoices found
                          </h3>

                          <p className="mt-1 text-sm text-slate-500">
                            {error
                              ? "Fix the API issue and refresh."
                              : "Try another search or create a new sale."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <AnimatePresence initial={false}>
                      {filteredInvoices.map((invoice, index) => {
                        const status = getStatus(invoice);

                        return (
                          <motion.tr
                            key={getInvoiceId(invoice) || getInvoiceNumber(invoice)}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8 }}
                            transition={{ delay: Math.min(index * 0.025, 0.2) }}
                            className="group transition-colors hover:bg-amber-50/40"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700 transition group-hover:bg-amber-100">
                                  <FileText size={18} />
                                </div>

                                <span className="font-semibold text-slate-900">
                                  {getInvoiceNumber(invoice)}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-medium text-slate-800">
                                {getCustomerName(invoice)}
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                {invoice?.customer?.mobileNumber ||
                                  invoice?.customer?.mobile ||
                                  "No mobile number"}
                              </div>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {formatDate(
                                invoice?.createdAt ||
                                  invoice?.invoiceDate ||
                                  invoice?.date
                              )}
                            </td>

                            <td className="px-5 py-4 font-semibold text-slate-900">
                              {formatCurrency(getAmount(invoice))}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${
                                  statusStyles[status] ||
                                  statusStyles.PENDING
                                }`}
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                {status}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">
                                <motion.button
                                  whileHover={{ scale: 1.12, rotate: 3 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => openInvoice(invoice)}
                                  title="View invoice"
                                  className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                >
                                  <Eye size={16} />
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.12, rotate: -3 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setSelectedInvoice(invoice);
                                    setTimeout(printInvoice, 100);
                                  }}
                                  title="Print invoice"
                                  className="rounded-lg border border-slate-200 p-2.5 text-slate-600 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700"
                                >
                                  <Printer size={16} />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col justify-between gap-2 border-t border-slate-100 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center">
              <p>
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </p>
              <p>Invoice records are loaded from your backend.</p>
            </div>
          </motion.section>
        </motion.div>
      </main>

      {/* Invoice details modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-6 print:static print:block print:bg-white print:p-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedInvoice(null);
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, rotateX: 5, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.97 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="invoice-paper max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl print:max-h-none print:max-w-none print:overflow-visible print:rounded-none print:shadow-none"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur print:hidden sm:px-8">
                <div>
                  <h2 className="text-lg font-bold">Invoice Details</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {getInvoiceNumber(selectedInvoice)}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Close invoice"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 sm:p-10">
                {detailsLoading && (
                  <p className="mb-4 text-sm text-slate-500 print:hidden">
                    Refreshing invoice details…
                  </p>
                )}

                <div className="flex flex-col justify-between gap-6 border-b-2 border-slate-900 pb-6 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-amber-400 p-3 text-slate-950">
                        <ReceiptText size={26} />
                      </div>
                      <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-950">
                          GANESH MOBILE SHOP
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                          Mobile phones & accessories
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-600">
                      Customer invoice
                    </p>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
                      Invoice
                    </p>
                    <p className="mt-2 text-xl font-bold text-slate-950">
                      {getInvoiceNumber(selectedInvoice)}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Date:{" "}
                      {formatDate(
                        selectedInvoice?.createdAt ||
                          selectedInvoice?.invoiceDate ||
                          selectedInvoice?.date
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 py-7 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Bill To
                    </p>
                    <div className="mt-3 flex items-start gap-3">
                      <UserRound
                        size={19}
                        className="mt-0.5 text-amber-700"
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          {getCustomerName(selectedInvoice)}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedInvoice?.customer?.mobileNumber ||
                            selectedInvoice?.customer?.mobile ||
                            "Mobile number not available"}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {selectedInvoice?.customer?.address ||
                            "Address not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment Details
                    </p>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-slate-600">
                        Method:{" "}
                        <span className="font-semibold text-slate-900">
                          {selectedInvoice?.paymentMethod ||
                            selectedInvoice?.sale?.paymentMethod ||
                            "—"}
                        </span>
                      </p>
                      <p className="text-slate-600">
                        Status:{" "}
                        <span className="font-semibold text-slate-900">
                          {getStatus(selectedInvoice)}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full min-w-[500px] text-left">
                    <thead className="bg-slate-50">
                      <tr className="text-xs uppercase tracking-wider text-slate-500">
                        <th className="px-4 py-3">Product</th>
                        <th className="px-4 py-3">IMEI / Serial</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {invoiceItems(selectedInvoice).length > 0 ? (
                        invoiceItems(selectedInvoice).map((item, index) => (
                          <tr key={item?._id || index}>
                            <td className="px-4 py-4 text-sm font-medium text-slate-900">
                              {item?.productName ||
                                item?.product?.model ||
                                item?.product?.name ||
                                item?.name ||
                                "Product"}
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-500">
                              {item?.imei ||
                                item?.serialNumber ||
                                item?.serial ||
                                "—"}
                            </td>
                            <td className="px-4 py-4 text-center text-sm">
                              {item?.quantity || 1}
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-semibold">
                              {formatCurrency(
                                item?.total ??
                                  item?.amount ??
                                  item?.price ??
                                  item?.sellingPrice ??
                                  0
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-8 text-center text-sm text-slate-500"
                          >
                            No product line items were returned by the API.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="ml-auto mt-6 max-w-sm space-y-3">
                  <div className="flex justify-between gap-4 text-sm text-slate-600">
                    <span>Subtotal</span>
                    <span>
                      {formatCurrency(
                        selectedInvoice?.subtotal ??
                          selectedInvoice?.subTotal ??
                          selectedInvoice?.sale?.sellingPrice ??
                          getAmount(selectedInvoice)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm text-slate-600">
                    <span>Discount</span>
                    <span>
                      −{" "}
                      {formatCurrency(
                        selectedInvoice?.discount ??
                          selectedInvoice?.sale?.discount ??
                          0
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 border-t-2 border-slate-900 pt-4">
                    <span className="font-bold text-slate-950">
                      Total Amount
                    </span>
                    <span className="text-xl font-black text-slate-950">
                      {formatCurrency(getAmount(selectedInvoice))}
                    </span>
                  </div>
                </div>

                <div className="mt-10 border-t border-dashed border-slate-300 pt-6 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    Thank you for shopping with us!
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    Please keep this invoice for your warranty records.
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3 print:hidden">
                  <AnimatedButton onClick={printInvoice}>
                    <Printer size={16} />
                    Print Invoice
                  </AnimatedButton>

                  <AnimatedButton
                    variant="primary"
                    onClick={() => downloadInvoice(selectedInvoice)}
                  >
                    <Download size={16} />
                    Download PDF
                  </AnimatedButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .invoice-paper,
          .invoice-paper * {
            visibility: visible;
          }

          .invoice-paper {
            position: absolute;
            inset: 0;
            width: 100%;
            max-width: none;
            overflow: visible;
          }

          @page {
            size: A4;
            margin: 12mm;
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
