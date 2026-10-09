
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  CalendarDays,
  IndianRupee,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";

import api from "../../services/api";

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

function Payments() {
  const [payments, setPayments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [processingId, setProcessingId] = useState("");
  const [notice, setNotice] = useState("");

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

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const customerName =
        payment.customer?.name || "Unknown customer";

      const invoiceNumber =
        payment.sale?.invoiceNumber || "";

      const searchable = [
        invoiceNumber,
        customerName,
        payment.customer?.mobileNumber || "",
        payment.paymentMethod || "",
        payment.status || "",
        payment.transactionId || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchable.includes(query);

      const matchesStatus =
        statusFilter === "ALL" || payment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: payments.length,
      paid: payments.filter((p) => p.status === "PAID").length,
      pending: payments.filter((p) => p.status === "PENDING").length,
      failed: payments.filter((p) => p.status === "FAILED").length,
      totalCollected: payments
        .filter((p) => p.status === "PAID")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    };
  }, [payments]);

  const handleCompletePayment = async (payment) => {
    if (payment.status !== "PENDING") return;

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
      await api.patch(`/payments/${payment._id}/complete`);

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

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#191919]">
      <Sidebar />

      <main className="min-h-screen p-4 sm:p-6 lg:ml-[250px] lg:p-8">
        <div className="mx-auto max-w-[1600px]">
          {/* Header */}
          <header className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Payments
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage payment transactions
              </p>
            </div>

            <button
              type="button"
              onClick={loadPayments}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F4C64E] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#e7b83b] disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </header>

          {/* Messages */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {notice && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
              <CheckCircle2 size={18} />
              {notice}
              <button
                type="button"
                onClick={() => setNotice("")}
                className="ml-auto"
                aria-label="Dismiss notification"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {/* Summary cards */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
          </div>

          {/* Payments table */}
          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Payment Transactions
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage recorded payments
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 sm:w-72">
                  <Search
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search payments..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-[#D4AF37] focus:bg-white"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#D4AF37]"
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
              <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-gray-500">
                <RefreshCw size={20} className="animate-spin" />
                Loading payments...
              </div>
            ) : filteredPayments.length === 0 ? (
              <div className="flex min-h-64 flex-col items-center justify-center px-5 text-center">
                <div className="mb-3 rounded-2xl bg-gray-100 p-4">
                  <CreditCard size={30} className="text-gray-400" />
                </div>
                <h3 className="font-semibold">No payments found</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Payments will appear here when sales create payment
                  records. Try changing your search or status filter.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[950px] text-left text-sm">
                    <thead className="bg-[#FAFAFA] text-xs uppercase tracking-wide text-gray-500">
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

                    <tbody className="divide-y divide-gray-100">
                      {filteredPayments.map((payment, index) => (
                        <tr
                          key={payment._id}
                          className="transition hover:bg-[#FFFCF2]"
                        >
                          <td className="px-5 py-4 text-gray-500">
                            {index + 1}
                          </td>

                          <td className="px-5 py-4">
                            <span className="font-semibold text-gray-900">
                              {payment.sale?.invoiceNumber || "—"}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p className="font-medium text-gray-800">
                              {payment.customer?.name || "Unknown customer"}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {payment.customer?.mobileNumber || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4 font-semibold">
                            {formatMoney(payment.amount)}
                          </td>

                          <td className="px-5 py-4 text-gray-600">
                            {methodLabel(payment.paymentMethod)}
                          </td>

                          <td className="px-5 py-4">
                            <StatusBadge status={payment.status} />
                          </td>

                          <td className="px-5 py-4 whitespace-nowrap text-gray-600">
                            {formatDate(payment.createdAt)}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={async () => {
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
                                }}
                                title="View payment"
                                aria-label="View payment"
                                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:border-[#D4AF37] hover:bg-[#FFF8E1] hover:text-black"
                              >
                                <Eye size={16} />
                              </button>

                              {payment.status === "PENDING" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCompletePayment(payment)
                                  }
                                  disabled={processingId === payment._id}
                                  title="Complete payment"
                                  aria-label="Complete payment"
                                  className="rounded-lg bg-[#F4C64E] p-2 text-black transition hover:bg-[#e7b83b] disabled:opacity-50"
                                >
                                  {processingId === payment._id ? (
                                    <RefreshCw
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : (
                                    <CheckCircle2 size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-2 border-t border-gray-100 px-5 py-4 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing {filteredPayments.length} of {payments.length}{" "}
                    payments
                  </span>
                  <span>All amounts in Indian Rupees (₹)</span>
                </div>
              </>
            )}
          </section>
        </div>
      </main>

      {/* Payment details modal */}
      {selectedPayment && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedPayment(null);
            }
          }}
        >
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-lg font-bold">Payment Details</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedPayment.sale?.invoiceNumber || "Invoice unavailable"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
                <div>
                  <p className="text-sm text-gray-500">Payment amount</p>
                  <p className="mt-1 text-2xl font-extrabold">
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
                value={selectedPayment.customer?.mobileNumber || "—"}
              />
              <DetailRow
                label="Payment method"
                value={methodLabel(selectedPayment.paymentMethod)}
              />
              <DetailRow
                label="Transaction ID"
                value={selectedPayment.transactionId || "Not provided"}
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
                <button
                  type="button"
                  disabled={processingId === selectedPayment._id}
                  onClick={() => handleCompletePayment(selectedPayment)}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#F4C64E] px-4 py-3 font-bold text-black transition hover:bg-[#e7b83b] disabled:opacity-50"
                >
                  <CheckCircle2 size={18} />
                  Mark Payment Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon: Icon, iconClass, compact }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p
            className={`mt-3 break-words font-extrabold tracking-tight ${
              compact ? "text-xl sm:text-2xl" : "text-3xl"
            }`}
          >
            {value}
          </p>
          <p className="mt-2 text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 ${iconClass}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = statusStyles[status] || "bg-gray-100 text-gray-600";

  const Icon =
    status === "PAID"
      ? CheckCircle2
      : status === "PENDING"
        ? Clock3
        : status === "FAILED"
          ? XCircle
          : AlertCircle;

  const label = status === "PAID" ? "Completed" : status || "Unknown";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${styles}`}
    >
      <Icon size={13} />
      {label}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 text-sm last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="max-w-[65%] break-words text-right font-medium text-gray-800">
        {value}
      </span>
    </div>
  );
}

export default Payments;
