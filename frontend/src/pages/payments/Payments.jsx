
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock3,
  XCircle,
  AlertCircle,
  X,
  IndianRupee,
  ArrowUpRight,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

// ==================================================
// THEME AND HELPERS
// ==================================================

const PAGE_BG = "#F4F0E6";

const formatMoney = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (date) => {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  PAID: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const methodLabel = (method) => {
  const labels = {
    CASH: "Cash",
    UPI: "UPI",
    CARD: "Card",
    ONLINE: "Online",
    COD: "Cash on Delivery",
  };

  return labels[method] || method || "—";
};

const spring = {
  type: "spring",
  stiffness: 350,
  damping: 25,
};

const pageVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// ==================================================
// ANIMATED BUTTON
// ==================================================

function AnimatedButton({
  children,
  onClick,
  disabled = false,
  className = "",
  type = "button",
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={
        disabled ? undefined : { y: -2, scale: 1.02 }
      }
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={spring}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4C64E] px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition-colors hover:bg-[#E7B83B] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </motion.button>
  );
}

// ==================================================
// STAT CARD
// ==================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconClass,
  compact = false,
}) {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{
        y: -4,
        boxShadow: "0 12px 25px rgba(15,23,42,0.07)",
      }}
      transition={spring}
      className="rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#746D5E]">
            {title}
          </p>

          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 break-words font-extrabold tracking-tight text-[#171914] ${
              compact ? "text-xl sm:text-2xl" : "text-3xl"
            }`}
          >
            {value}
          </motion.p>

          <p className="mt-2 text-xs text-[#746D5E]">
            {subtitle}
          </p>
        </div>

        <motion.div
          whileHover={{ rotate: 8, scale: 1.08 }}
          transition={spring}
          className={`rounded-xl p-3 ${iconClass}`}
        >
          <Icon size={22} />
        </motion.div>
      </div>
    </motion.div>
  );
}

// ==================================================
// STATUS BADGE
// ==================================================

function StatusBadge({ status }) {
  const styles =
    statusStyles[status] || "bg-gray-100 text-gray-600";

  const Icon =
    status === "PAID"
      ? CheckCircle2
      : status === "PENDING"
        ? Clock3
        : status === "FAILED"
          ? XCircle
          : AlertCircle;

  const label =
    status === "PAID" ? "Completed" : status || "Unknown";

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={spring}
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${styles}`}
    >
      <Icon size={13} />
      {label}
    </motion.span>
  );
}

// ==================================================
// DETAIL ROW
// ==================================================

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[#EEE5D2] pb-3 text-sm last:border-0">
      <span className="text-[#746D5E]">{label}</span>

      <span className="max-w-[65%] break-words text-right font-medium text-[#171914]">
        {value}
      </span>
    </div>
  );
}

// ==================================================
// ALERT MESSAGE
// ==================================================

function AlertMessage({ type = "error", message, onClose }) {
  const isError = type === "error";
  const Icon = isError ? AlertCircle : CheckCircle2;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`mb-5 flex items-start gap-3 rounded-xl border p-4 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />

      <span className="flex-1">{message}</span>

      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss message"
      >
        <X size={17} />
      </button>
    </motion.div>
  );
}

// ==================================================
// PAYMENTS PAGE
// ==================================================

function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processingId, setProcessingId] = useState("");

  // LOAD PAYMENTS

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/payments");
      setPayments(response.data.payments || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load payments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  // SEARCH AND FILTER

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const searchable = [
        payment.sale?.invoiceNumber || "",
        payment.customer?.name || "Unknown customer",
        payment.customer?.mobileNumber || "",
        payment.paymentMethod || "",
        payment.status || "",
        payment.transactionId || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchable.includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  // STATISTICS

  const stats = useMemo(
    () => ({
      total: payments.length,

      paid: payments.filter(
        (payment) => payment.status === "PAID"
      ).length,

      pending: payments.filter(
        (payment) => payment.status === "PENDING"
      ).length,

      failed: payments.filter(
        (payment) => payment.status === "FAILED"
      ).length,

      totalCollected: payments
        .filter((payment) => payment.status === "PAID")
        .reduce(
          (sum, payment) =>
            sum + Number(payment.amount || 0),
          0
        ),
    }),
    [payments]
  );

  // VIEW PAYMENT

  const handleViewPayment = async (payment) => {
    setError("");

    try {
      const response = await api.get(
        `/payments/${payment._id}`
      );

      setSelectedPayment(response.data.payment);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load payment details."
      );
    }
  };

  // COMPLETE PAYMENT

  const handleCompletePayment = async (payment) => {
    if (
      !payment?._id ||
      payment.status !== "PENDING" ||
      processingId
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Confirm that payment for invoice ${
        payment.sale?.invoiceNumber || "this sale"
      } has actually been received?`
    );

    if (!confirmed) return;

    setProcessingId(payment._id);
    setError("");
    setNotice("");

    try {
      await api.patch(
        `/payments/${payment._id}/complete`
      );

      setNotice("Payment completed successfully.");

      await loadPayments();

      if (selectedPayment?._id === payment._id) {
        const detailResponse = await api.get(
          `/payments/${payment._id}`
        );

        setSelectedPayment(detailResponse.data.payment);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to complete payment."
      );
    } finally {
      setProcessingId("");
    }
  };

  // PAGE UI

  return (
    <div
      className="min-h-screen text-[#171914]"
      style={{ backgroundColor: PAGE_BG }}
    >
      <Sidebar />

      <main className="min-h-screen p-4 sm:p-6 lg:ml-[250px] lg:p-8">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="mx-auto max-w-[1600px]"
        >
          {/* SIMPLE PAGE HEADING — NO HEADER BOX */}

          <motion.header
            variants={itemVariants}
            className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"
          >
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#171914] sm:text-3xl">
                Payments
              </h1>

              <p className="mt-1 text-sm text-[#746D5E] sm:text-base">
                Manage payment transactions and verify received payments.
              </p>
            </div>

            <AnimatedButton
              onClick={loadPayments}
              disabled={loading}
              className="shrink-0 self-start sm:self-auto"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </AnimatedButton>
          </motion.header>

          {/* ALERTS */}

          <AnimatePresence mode="wait">
            {error && (
              <AlertMessage
                key="error"
                type="error"
                message={error}
                onClose={() => setError("")}
              />
            )}

            {!error && notice && (
              <AlertMessage
                key="notice"
                type="success"
                message={notice}
                onClose={() => setNotice("")}
              />
            )}
          </AnimatePresence>

          {/* STATISTICS */}

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.08 },
              },
            }}
            initial="hidden"
            animate="visible"
            className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <StatCard
              title="Total Payments"
              value={stats.total}
              subtitle="All transactions"
              icon={CreditCard}
              iconClass="bg-blue-50 text-blue-600"
            />

            <StatCard
              title="Completed"
              value={stats.paid}
              subtitle="Successfully paid"
              icon={CheckCircle2}
              iconClass="bg-green-50 text-green-600"
            />

            <StatCard
              title="Pending"
              value={stats.pending}
              subtitle="Awaiting payment"
              icon={Clock3}
              iconClass="bg-amber-50 text-amber-600"
            />

            <StatCard
              title="Amount Collected"
              value={formatMoney(stats.totalCollected)}
              subtitle={`${stats.failed} failed transaction(s)`}
              icon={IndianRupee}
              iconClass="bg-[#FFF6D9] text-[#9B7613]"
              compact
            />
          </motion.div>

          {/* PAYMENTS TABLE */}

          <motion.section
            variants={itemVariants}
            whileHover={{
              boxShadow: "0 15px 35px rgba(15,23,42,0.05)",
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-sm"
          >
<div className="min-h-screen w-full bg-[#F4F0E6] p-4 sm:p-6 lg:p-8">              <div>
                <h2 className="text-lg font-bold text-[#171914]">
                  Payment Transactions
                </h2>

                <p className="mt-1 text-sm text-[#746D5E]">
                  View and manage recorded payments.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#948A76]"
                  />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search payments..."
                    className="w-full rounded-xl border border-[#E6D9BD] bg-[#F9F6EE] py-2.5 pl-10 pr-3 text-sm text-[#171914] outline-none transition focus:border-[#D4AF37] focus:bg-white focus:ring-4 focus:ring-amber-100"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="rounded-xl border border-[#E6D9BD] bg-[#FFFEFA] px-3 py-2.5 text-sm text-[#171914] outline-none transition focus:border-[#D4AF37] focus:ring-4 focus:ring-amber-100"
                >
                  <option value="ALL">All Status</option>
                  <option value="PAID">Completed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#746D5E]">
                <RefreshCw
                  size={20}
                  className="animate-spin"
                />
                Loading payments...
              </div>
            ) : filteredPayments.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex min-h-64 flex-col items-center justify-center px-5 text-center"
              >
                <div className="mb-3 rounded-2xl bg-[#F4F0E6] p-4">
                  <CreditCard
                    size={30}
                    className="text-[#948A76]"
                  />
                </div>

                <h3 className="font-semibold text-[#171914]">
                  No payments found
                </h3>

                <p className="mt-1 max-w-sm text-sm text-[#746D5E]">
                  Payments will appear here when sales create payment
                  records. Try changing your search or status filter.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left text-sm">
                    <thead className="bg-[#F5F0E5] text-xs uppercase tracking-wide text-[#746D5E]">
                      <tr>
                        <th className="px-5 py-4 font-semibold">#</th>
                        <th className="px-5 py-4 font-semibold">
                          Invoice No.
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Customer
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Amount
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Method
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Status
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Date
                        </th>
                        <th className="px-5 py-4 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[#EEE5D2]">
                      <AnimatePresence mode="popLayout">
                        {filteredPayments.map((payment, index) => (
                          <motion.tr
                            layout
                            key={payment._id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={spring}
                            whileHover={{
                              backgroundColor: "#FFF8E5",
                            }}
                          >
                            <td className="px-5 py-4 text-[#746D5E]">
                              {index + 1}
                            </td>

                            <td className="px-5 py-4">
                              <span className="font-semibold text-[#171914]">
                                {payment.sale?.invoiceNumber || "—"}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-medium text-[#171914]">
                                {payment.customer?.name ||
                                  "Unknown customer"}
                              </p>

                              <p className="mt-1 text-xs text-[#746D5E]">
                                {payment.customer?.mobileNumber || "—"}
                              </p>
                            </td>

                            <td className="px-5 py-4 font-semibold text-[#171914]">
                              {formatMoney(payment.amount)}
                            </td>

                            <td className="px-5 py-4 text-[#746D5E]">
                              {methodLabel(payment.paymentMethod)}
                            </td>

                            <td className="px-5 py-4">
                              <StatusBadge status={payment.status} />
                            </td>

                            <td className="whitespace-nowrap px-5 py-4 text-[#746D5E]">
                              {formatDate(payment.createdAt)}
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.06 }}
                                  whileTap={{ scale: 0.94 }}
                                  onClick={() =>
                                    handleViewPayment(payment)
                                  }
                                  title="View payment"
                                  aria-label="View payment"
                                  className="rounded-lg border border-[#E6D9BD] bg-[#FFFEFA] p-2 text-[#746D5E] transition hover:border-[#D4AF37] hover:bg-[#FFF6D9] hover:text-black"
                                >
                                  <Eye size={16} />
                                </motion.button>

                                {payment.status === "PENDING" && (
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.06 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() =>
                                      handleCompletePayment(payment)
                                    }
                                    disabled={Boolean(processingId)}
                                    title="Complete payment"
                                    aria-label="Complete payment"
                                    className="rounded-lg bg-[#F4C64E] p-2 text-black transition hover:bg-[#E7B83B] disabled:opacity-50"
                                  >
                                    {processingId === payment._id ? (
                                      <RefreshCw
                                        size={16}
                                        className="animate-spin"
                                      />
                                    ) : (
                                      <CheckCircle2 size={16} />
                                    )}
                                  </motion.button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-2 border-t border-[#EEE5D2] px-5 py-4 text-sm text-[#746D5E] sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing {filteredPayments.length} of{" "}
                    {payments.length} payments
                  </span>

                  <span>
                    All amounts in Indian Rupees (₹)
                  </span>
                </div>
              </>
            )}
          </motion.section>
        </motion.div>
      </main>

      {/* PAYMENT DETAILS MODAL */}

      <AnimatePresence>
        {selectedPayment && (
          <motion.div
            key="payment-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                setSelectedPayment(null);
              }
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          >
            <motion.div
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
                y: 12,
                scale: 0.97,
              }}
              transition={spring}
              className="w-full max-w-lg overflow-hidden rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#EEE5D2] p-5">
                <div>
                  <h2 className="text-lg font-bold text-[#171914]">
                    Payment Details
                  </h2>

                  <p className="mt-1 text-sm text-[#746D5E]">
                    {selectedPayment.sale?.invoiceNumber ||
                      "Invoice unavailable"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="rounded-lg p-2 text-[#746D5E] transition hover:bg-[#F4F0E6]"
                  aria-label="Close details"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[#E6D9BD] bg-[#F5F0E5] p-4">
                  <div>
                    <p className="text-sm text-[#746D5E]">
                      Payment amount
                    </p>

                    <p className="mt-1 text-2xl font-extrabold text-[#171914]">
                      {formatMoney(selectedPayment.amount)}
                    </p>
                  </div>

                  <StatusBadge status={selectedPayment.status} />
                </div>

                <DetailRow
                  label="Customer"
                  value={selectedPayment.customer?.name || "—"}
                />

                <DetailRow
                  label="Mobile number"
                  value={
                    selectedPayment.customer?.mobileNumber || "—"
                  }
                />

                <DetailRow
                  label="Payment method"
                  value={methodLabel(selectedPayment.paymentMethod)}
                />

                <DetailRow
                  label="Transaction ID"
                  value={
                    selectedPayment.transactionId || "Not provided"
                  }
                />

                <DetailRow
                  label="Created date"
                  value={formatDate(selectedPayment.createdAt)}
                />

                <DetailRow
                  label="Paid date"
                  value={formatDate(selectedPayment.paidAt)}
                />

                {selectedPayment.status === "PENDING" && (
                  <AnimatedButton
                    className="mt-2 w-full py-3"
                    disabled={Boolean(processingId)}
                    onClick={() =>
                      handleCompletePayment(selectedPayment)
                    }
                  >
                    {processingId === selectedPayment._id ? (
                      <RefreshCw
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <CheckCircle2 size={18} />
                    )}

                    Mark Payment Completed
                    <ArrowUpRight size={16} />
                  </AnimatedButton>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Payments;
