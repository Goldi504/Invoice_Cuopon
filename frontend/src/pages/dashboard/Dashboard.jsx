
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Smartphone,
} from "lucide-react";

import {
  getDashboardSummary,
  getTodaySales,
  getRecentSales,
  getStockSummary,
  getCustomerStatistics,
  getMonthlySales,
} from "../../services/dashboard.api";

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const formatMoney = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatNumber = (value) =>
  Number(value || 0).toLocaleString("en-IN");

const getLocalDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatSelectedDate = (date) => {
  if (!date) return "Select date";

  return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [todaySales, setTodaySales] = useState(null);
  const [recentSales, setRecentSales] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);
  const [customerStats, setCustomerStats] = useState(null);
  const [monthlySales, setMonthlySales] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Calendar state must be directly inside the component.
  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const loadDashboard = useCallback(async (refresh = false) => {
    try {
      setError("");

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const [
        summaryResponse,
        todayResponse,
        recentResponse,
        stockResponse,
        customerResponse,
        monthlyResponse,
      ] = await Promise.all([
        getDashboardSummary(),
        getTodaySales(),
        getRecentSales(10),
        getStockSummary(),
        getCustomerStatistics(),
        getMonthlySales(),
      ]);

      setSummary(summaryResponse?.summary || {});
      setTodaySales(todayResponse || {});
      setRecentSales(recentResponse?.sales || []);
      setStockSummary(stockResponse?.stock || []);
      setCustomerStats(customerResponse?.customers || {});
      setMonthlySales(monthlyResponse?.monthlySales || []);
    } catch (err) {
      console.error("Dashboard loading error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Dashboard values
  const totalCustomers = summary?.totalCustomers || 0;
  const availableStock = summary?.availableStock || 0;
  const soldStock = summary?.soldStock || 0;
  const totalRevenue = summary?.totalRevenue || 0;
  const totalProducts = Number(availableStock) + Number(soldStock);

  const lowStockCount =
    stockSummary.find((item) => item._id === "LOW_STOCK")?.count || 0;

  // Top products derived from recent sales
  const topProducts = useMemo(() => {
    const productMap = {};

    recentSales.forEach((sale) => {
      const product = sale.product;
      if (!product) return;

      const productId = product._id || product.id;
      if (!productId) return;

      const productName = product.model || product.name || "Mobile";

      if (!productMap[productId]) {
        productMap[productId] = {
          id: productId,
          name: productName,
          sold: 0,
        };
      }

      productMap[productId].sold += 1;
    });

    return Object.values(productMap)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5);
  }, [recentSales]);

  // Chart data
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const found = monthlySales.find(
        (item) => Number(item?._id?.month) === index + 1
      );

      return {
        month: monthNames[index],
        revenue: Number(found?.revenue || 0),
      };
    });
  }, [monthlySales]);

  const maxRevenue = Math.max(
    ...chartData.map((item) => item.revenue),
    1
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl bg-white"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-[420px] animate-pulse rounded-2xl bg-white xl:col-span-2" />
          <div className="h-[420px] animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="max-w-md px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={25} className="text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-slate-950">
            Dashboard could not load
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F4C64E] px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-[#E9B52F]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Good morning, Admin! Here's what's happening today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh */}
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            aria-label="Refresh dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

          {/* Working date picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCalendarOpen((open) => !open)}
              aria-expanded={calendarOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium shadow-sm transition hover:border-[#F2C94E] sm:gap-3 sm:px-4"
            >
              <CalendarDays size={17} />
              <span>{formatSelectedDate(selectedDate)}</span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  calendarOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {calendarOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close calendar"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setCalendarOpen(false)}
                />

                <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-4 shadow-xl">
                  <label
                    htmlFor="dashboard-date"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Select date
                  </label>

                  <input
                    id="dashboard-date"
                    type="date"
                    value={selectedDate}
                    max={getLocalDate()}
                    onChange={(event) => {
                      if (event.target.value) {
                        setSelectedDate(event.target.value);
                        setCalendarOpen(false);
                      }
                    }}
                    className="w-full rounded-lg border border-gray-200 p-2 text-sm outline-none focus:border-[#F2C94E]"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(getLocalDate());
                      setCalendarOpen(false);
                    }}
                    className="mt-3 w-full rounded-lg bg-[#F2C94E] px-3 py-2 text-sm font-semibold text-gray-900 transition hover:bg-[#e7bb3d]"
                  >
                    Today
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Sales"
          value={formatMoney(totalRevenue)}
          icon={ShoppingCart}
          iconClass="bg-blue-50 text-blue-600"
          change="+12%"
          changeClass="text-emerald-600"
        />

        <StatCard
          title="Total Customers"
          value={formatNumber(totalCustomers)}
          icon={Users}
          iconClass="bg-emerald-50 text-emerald-600"
          change={
            customerStats?.newCustomersToday
              ? `+${customerStats.newCustomersToday}`
              : "0"
          }
          changeClass="text-emerald-600"
          changeText="new today"
        />

        <StatCard
          title="Total Products"
          value={formatNumber(totalProducts)}
          icon={Package}
          iconClass="bg-amber-50 text-amber-600"
          change={formatNumber(availableStock)}
          changeClass="text-amber-600"
          changeText="available"
        />

        <StatCard
          title="Low Stock Items"
          value={formatNumber(lowStockCount)}
          icon={AlertCircle}
          iconClass="bg-red-50 text-red-500"
          change={formatNumber(soldStock)}
          changeClass="text-red-500"
          changeText="sold stock"
        />
      </div>

      {/* Sales overview and top products */}
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Sales chart */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:shadow-lg sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Sales Overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Monthly sales performance
              </p>
            </div>

            <span className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
              This Year
            </span>
          </div>

          <div className="mt-8 h-[260px] min-w-0 sm:h-[300px]">
            <svg
              viewBox="0 0 800 300"
              className="h-full w-full"
              preserveAspectRatio="none"
              role="img"
              aria-label="Monthly revenue chart"
            >
              {[50, 100, 150, 200, 250].map((y) => (
                <line
                  key={y}
                  x1="45"
                  y1={y}
                  x2="775"
                  y2={y}
                  stroke="#E2E8F0"
                  strokeDasharray="5 5"
                />
              ))}

              {(() => {
                const points = chartData.map((item, index) => {
                  const x = 45 + (index * 730) / 11;
                  const y = 255 - (item.revenue / maxRevenue) * 205;
                  return `${x},${y}`;
                });

                return (
                  <>
                    <polyline
                      points={points.join(" ")}
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {chartData.map((item, index) => {
                      const x = 45 + (index * 730) / 11;
                      const y =
                        255 - (item.revenue / maxRevenue) * 205;

                      return (
                        <circle
                          key={item.month}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="white"
                          stroke="#2563EB"
                          strokeWidth="4"
                        >
                          <title>
                            {item.month}: {formatMoney(item.revenue)}
                          </title>
                        </circle>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            <div className="mt-2 flex justify-between gap-1 px-1">
              {chartData.map((item) => (
                <span
                  key={item.month}
                  className="text-[9px] text-slate-400 sm:text-[11px]"
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Top selling products */}
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:shadow-lg sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Top Selling Products
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Based on recent sales
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                No sales available
              </div>
            ) : (
              topProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 transition group-hover:bg-blue-50">
                    <Smartphone size={19} className="text-blue-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {product.name}
                      </p>

                      <span className="shrink-0 text-xs text-slate-500">
                        {product.sold} sold
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#F4C64E] transition-all duration-500 group-hover:bg-[#E9B52F]"
                        style={{
                          width: `${Math.min(product.sold * 20, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconClass,
  change,
  changeClass,
  changeText,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <h2 className="mt-3 break-words text-2xl font-bold text-slate-950">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110 ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className={`flex items-center gap-1 text-xs font-bold ${changeClass}`}>
          <ArrowUpRight size={14} />
          {change}
        </span>

        <span className="text-xs text-slate-400">
          {changeText || "from last week"}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
