
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  IndianRupee,
  ShoppingBag,
  CreditCard,
  RefreshCw,
  CalendarDays,
  Download,
  BarChart3,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";
import api from "../../services/api";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value) =>
  new Intl.NumberFormat("en-IN").format(Number(value) || 0);

function StatCard({ title, value, icon: Icon, color, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -3 }}
      className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`rounded-xl p-3 ${color}`}>
          <Icon size={20} />
        </div>
      </div>
      <p className="mt-4 break-words text-2xl font-bold text-gray-900">
        {value}
      </p>
    </motion.div>
  );
}

function Reports() {
  const [summary, setSummary] = useState(null);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // These requests use the existing dashboard and payment routes.
      const [summaryResult, monthlyResult, paymentsResult] =
        await Promise.allSettled([
          api.get("/dashboard/summary"),
          api.get("/dashboard/monthly-sales"),
          api.get("/payments"),
        ]);

      if (summaryResult.status === "fulfilled") {
        const data = summaryResult.value.data;
        setSummary(data?.summary ?? data?.data ?? data);
      } else {
        setSummary(null);
      }

      if (monthlyResult.status === "fulfilled") {
        const data = monthlyResult.value.data;
        const list = Array.isArray(data)
          ? data
          : data?.monthlySales ??
            data?.sales ??
            data?.data ??
            [];
        setSales(Array.isArray(list) ? list : []);
      } else {
        setSales([]);
      }

      if (paymentsResult.status === "fulfilled") {
        const data = paymentsResult.value.data;
        const list = Array.isArray(data)
          ? data
          : data?.payments ?? data?.data ?? [];
        setPayments(Array.isArray(list) ? list : []);
      } else {
        setPayments([]);
      }

      if (
        summaryResult.status === "rejected" &&
        monthlyResult.status === "rejected" &&
        paymentsResult.status === "rejected"
      ) {
        setError(
          "Could not load reports. Check your server connection and login status."
        );
      }
    } catch {
      setError("Unable to load reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const getAmount = (item) =>
    Number(
      item?.totalAmount ??
        item?.totalSales ??
        item?.revenue ??
        item?.amount ??
        item?.total ??
        0
    );

  const getStatus = (payment) =>
    String(payment?.status ?? "").toLowerCase();

  const getMethod = (payment) =>
    String(
      payment?.method ??
        payment?.paymentMethod ??
        payment?.methodType ??
        "Other"
    ).toLowerCase();

  const totalRevenue = Number(
    summary?.totalRevenue ??
      summary?.totalSales ??
      summary?.revenue ??
      0
  );

  const totalSales = Number(
    summary?.totalSalesCount ??
      summary?.salesCount ??
      summary?.totalOrders ??
      summary?.totalSales ??
      0
  );

  const completedPayments = payments.filter((payment) =>
    ["completed", "paid", "success", "successful"].includes(
      getStatus(payment)
    )
  );

  const completedAmount = completedPayments.reduce(
    (total, payment) => total + getAmount(payment),
    0
  );

  const paymentMethods = [
    { name: "Cash", keys: ["cash"] },
    { name: "UPI", keys: ["upi"] },
    { name: "Card", keys: ["card", "credit card", "debit card"] },
    { name: "Other", keys: ["other", "online", "bank transfer"] },
  ].map((method) => {
    const matching = completedPayments.filter((payment) =>
      method.keys.includes(getMethod(payment))
    );

    return {
      name: method.name,
      count: matching.length,
      amount: matching.reduce(
        (total, payment) => total + getAmount(payment),
        0
      ),
    };
  });

  const getSaleLabel = (item, index) =>
    item?.month ??
    item?.label ??
    item?.date ??
    item?.name ??
    `Item ${index + 1}`;

  const filteredSales = sales.slice(-(
    period === "week" ? 7 : period === "year" ? 12 : 6
  ));

  const maxSale = Math.max(
    1,
    ...filteredSales.map((item) => getAmount(item))
  );

  const exportCsv = () => {
    const rows = [
      ["Report", "Amount / Count"],
      ["Total Revenue", totalRevenue],
      ["Sales Count", totalSales],
      ["Completed Payments", completedPayments.length],
      ["Completed Payment Amount", completedAmount],
      [],
      ["Payment Method", "Transactions", "Amount"],
      ...paymentMethods.map((method) => [
        method.name,
        method.count,
        method.amount,
      ]),
      [],
      ["Sales Period", "Amount"],
      ...sales.map((item, index) => [
        getSaleLabel(item, index),
        getAmount(item),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            return `"${value.replace(/"/g, '""')}"`;
          })
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ganesh-mobile-shop-report.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen w-full bg-[#f8f9fa] text-gray-900">
      <Sidebar />

      <main className="min-h-screen min-w-0 p-4 pt-20 sm:p-6 sm:pt-20 lg:ml-[250px] lg:p-8">
        <div className="mx-auto w-full max-w-[1600px]">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              

              <h1 className="text-2xl font-bold sm:text-3xl">
                Reports
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Track sales, revenue, and payment activity.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadReports}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold shadow-sm hover:border-amber-300 disabled:opacity-60"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                onClick={exportCsv}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f4c64e] px-4 py-3 text-sm font-bold text-gray-900 transition hover:bg-[#e9b933]"
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
          </motion.header>

          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Summary cards */}
          <div className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={loading ? "Loading..." : money(totalRevenue)}
              icon={IndianRupee}
              color="bg-blue-50 text-blue-700"
              index={0}
            />

            <StatCard
              title="Sales"
              value={loading ? "Loading..." : number(totalSales)}
              icon={ShoppingBag}
              color="bg-amber-50 text-amber-700"
              index={1}
            />

            <StatCard
              title="Completed Payments"
              value={loading ? "Loading..." : number(completedPayments.length)}
              icon={CheckCircle2}
              color="bg-green-50 text-green-700"
              index={2}
            />

            <StatCard
              title="Collected Payments"
              value={loading ? "Loading..." : money(completedAmount)}
              icon={CreditCard}
              color="bg-purple-50 text-purple-700"
              index={3}
            />
          </div>

          {/* Sales chart */}
          <section className="mb-6 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold">Sales Overview</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Sales data returned by your dashboard API.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-xl border border-gray-200 px-3 py-2">
                <CalendarDays size={16} className="text-gray-500" />
                <select
                  value={period}
                  onChange={(event) => setPeriod(event.target.value)}
                  className="bg-transparent text-sm outline-none"
                >
                  <option value="week">Recent 7 records</option>
                  <option value="month">Recent 6 records</option>
                  <option value="year">Recent 12 records</option>
                </select>
              </div>
            </div>

            {filteredSales.length > 0 ? (
              <div className="flex h-64 items-end gap-3 overflow-x-auto border-b border-l border-gray-100 px-3 pt-5 sm:gap-5">
                {filteredSales.map((item, index) => {
                  const amount = getAmount(item);
                  const height = Math.max(
                    5,
                    (amount / maxSale) * 100
                  );

                  return (
                    <div
                      key={`${getSaleLabel(item, index)}-${index}`}
                      className="flex h-full min-w-[42px] flex-1 flex-col items-center justify-end gap-2"
                    >
                      <span className="whitespace-nowrap text-[10px] text-gray-500 sm:text-xs">
                        {money(amount)}
                      </span>

                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${height}%` }}
                        transition={{
                          duration: 0.6,
                          delay: index * 0.05,
                        }}
                        title={`${getSaleLabel(item, index)}: ${money(amount)}`}
                        className="w-full max-w-12 rounded-t-lg bg-[#f4c64e] transition-colors hover:bg-amber-500"
                      />

                      <span className="max-w-16 truncate text-[10px] text-gray-500 sm:text-xs">
                        {getSaleLabel(item, index)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-xl bg-gray-50 px-4 text-center">
                <BarChart3 size={34} className="mb-3 text-gray-300" />
                <p className="font-semibold text-gray-700">
                  No sales chart data available
                </p>
                <p className="mt-1 max-w-md text-sm text-gray-500">
                  The monthly-sales endpoint may return a different
                  data format, or no sales have been recorded yet.
                </p>
              </div>
            )}
          </section>

          {/* Payment breakdown */}
          <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="border-b border-gray-100 p-5 sm:p-6">
              <h2 className="text-lg font-bold">
                Payment Breakdown
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Completed payments grouped by payment method.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">
                      Payment Method
                    </th>
                    <th className="px-5 py-4 font-semibold">
                      Transactions
                    </th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Total Amount
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {paymentMethods.map((method) => (
                    <tr
                      key={method.name}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-5 py-4 font-semibold">
                        {method.name}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {number(method.count)}
                      </td>
                      <td className="px-5 py-4 text-right font-semibold">
                        {money(method.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>

                <tfoot className="bg-amber-50/60">
                  <tr>
                    <td className="px-5 py-4 font-bold">Total</td>
                    <td className="px-5 py-4 font-bold">
                      {number(completedPayments.length)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold">
                      {money(completedAmount)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <p className="mt-6 text-center text-xs text-gray-400">
            Ganesh Mobile Shop · Reports & Analytics
          </p>
        </div>
      </main>
    </div>
  );
}

export default Reports;
