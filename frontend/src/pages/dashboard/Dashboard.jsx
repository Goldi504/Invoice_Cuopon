
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Smartphone,
  X,
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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const shortMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const GOLD = "#E9B83F";
const GOLD_DARK = "#9B6B00";

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

const parseDate = (value) => {
  if (!value) return new Date();

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toDateString = (year, month, day) =>
  `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const formatSelectedDate = (value) => {
  if (!value) return "Select date";

  return parseDate(value).toLocaleDateString("en-GB", {
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

  const [selectedDate, setSelectedDate] = useState(getLocalDate);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = new Date();
    return { month: date.getMonth(), year: date.getFullYear() };
  });

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
        err?.response?.data?.message || "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // Close the calendar with Escape.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setCalendarOpen(false);
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const totalCustomers = summary?.totalCustomers || 0;
  const availableStock = summary?.availableStock || 0;
  const soldStock = summary?.soldStock || 0;
  const totalRevenue = summary?.totalRevenue || 0;
  const totalProducts = Number(availableStock) + Number(soldStock);

  const lowStockCount =
    stockSummary.find((item) => item._id === "LOW_STOCK")?.count || 0;

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

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => {
      const found = monthlySales.find(
        (item) => Number(item?._id?.month) === index + 1
      );

      return {
        month: shortMonthNames[index],
        revenue: Number(found?.revenue || 0),
      };
    });
  }, [monthlySales]);

  const maxRevenue = Math.max(
    ...chartData.map((item) => item.revenue),
    1
  );

  const calendarDays = useMemo(() => {
    const { month, year } = visibleMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-first calendar.
    const mondayOffset = (firstDay + 6) % 7;
    const cells = [];

    for (let i = 0; i < mondayOffset; i++) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(day);
    }

    while (cells.length % 7 !== 0) {
      cells.push(null);
    }

    return cells;
  }, [visibleMonth]);

  const changeMonth = (amount) => {
    setVisibleMonth((current) => {
      const date = new Date(
        current.year,
        current.month + amount,
        1
      );

      return {
        month: date.getMonth(),
        year: date.getFullYear(),
      };
    });
  };

  const chooseDate = (day) => {
    setSelectedDate(
      toDateString(visibleMonth.year, visibleMonth.month, day)
    );
    setCalendarOpen(false);
  };

  const goToToday = () => {
    const today = new Date();

    setSelectedDate(getLocalDate());
    setVisibleMonth({
      month: today.getMonth(),
      year: today.getFullYear(),
    });
    setCalendarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-w-0 space-y-6 rounded-2xl bg-[#F4F0E6] p-4 sm:p-6">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-[#E9DFC9]" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-36 animate-pulse rounded-2xl border border-[#E6D9BC] bg-[#FFFEFA]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="h-[420px] animate-pulse rounded-2xl bg-[#FFFEFA] xl:col-span-2" />
          <div className="h-[420px] animate-pulse rounded-2xl bg-[#FFFEFA]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-[#E6D9BC] bg-[#FFFEFA] px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle size={25} className="text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-bold text-[#171914]">
            Dashboard could not load
          </h2>

          <p className="mt-2 text-sm text-[#777263]">{error}</p>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#F2C94C] px-5 py-3 text-sm font-bold text-[#171914] transition hover:bg-[#E6B632]"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-w-0 -m-3 min-h-full space-y-6 bg-[#F4F0E6] p-4 text-[#171914] sm:-m-5 sm:p-6 lg:-m-6 lg:p-7">
      {/* Page heading */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#E8D59A] bg-[#FFF5D6] px-3 py-1 text-xs font-bold tracking-wide text-[#79570A]">
            <span className="h-2 w-2 rounded-full bg-[#E9B83F]" />
            SHOP OVERVIEW
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-[#171914]">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-[#746D5E]">
            Good morning, Admin! Here's what's happening today.
          </p>
        </div>

        {/* Actions and date picker */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            aria-label="Refresh dashboard"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5D9C1] bg-[#FFFEFA] text-[#796333] shadow-sm transition hover:border-[#D9AD35] hover:bg-[#FFF5D6] disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setCalendarOpen((open) => !open)}
              aria-expanded={calendarOpen}
              aria-haspopup="dialog"
              className="flex items-center gap-2 rounded-xl border border-[#E5D9C1] bg-[#FFFEFA] px-3 py-3 text-sm font-semibold text-[#29271F] shadow-sm transition hover:border-[#D9AD35] hover:bg-[#FFF9E9] sm:gap-3 sm:px-4"
            >
              <CalendarDays size={17} className="text-[#A7790D]" />
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

                <div
                  role="dialog"
                  aria-label="Choose a date"
                  className="absolute right-0 top-full z-50 mt-2 w-[min(330px,calc(100vw-32px))] rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-[0_18px_50px_rgba(35,29,16,0.20)] sm:p-5"
                >
                  {/* Calendar title */}
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-extrabold text-[#242117]">
                        Choose a date
                      </h2>
                      <p className="mt-1 text-xs text-[#8A806D]">
                        Select month, year and day
                      </p>
                    </div>

                    <button
                      type="button"
                      aria-label="Close calendar"
                      onClick={() => setCalendarOpen(false)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#82765E] transition hover:bg-[#F4EBD7]"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  {/* Month and year selectors */}
                  <div className="grid grid-cols-[1fr_105px] gap-2">
                    <select
                      aria-label="Choose month"
                      value={visibleMonth.month}
                      onChange={(event) =>
                        setVisibleMonth((current) => ({
                          ...current,
                          month: Number(event.target.value),
                        }))
                      }
                      className="min-w-0 rounded-lg border border-[#E6D9BD] bg-[#FBF8F0] px-2 py-2.5 text-sm font-semibold text-[#302B20] outline-none focus:border-[#C99A24] focus:ring-2 focus:ring-[#F2C94C]/20"
                    >
                      {monthNames.map((month, index) => (
                        <option key={month} value={index}>
                          {month}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Choose year"
                      value={visibleMonth.year}
                      onChange={(event) =>
                        setVisibleMonth((current) => ({
                          ...current,
                          year: Number(event.target.value),
                        }))
                      }
                      className="min-w-0 rounded-lg border border-[#E6D9BD] bg-[#FBF8F0] px-2 py-2.5 text-sm font-semibold text-[#302B20] outline-none focus:border-[#C99A24] focus:ring-2 focus:ring-[#F2C94C]/20"
                    >
                      {Array.from(
                        { length: 31 },
                        (_, index) => new Date().getFullYear() - 15 + index
                      ).map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Month navigation */}
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      type="button"
                      aria-label="Previous month"
                      onClick={() => changeMonth(-1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E9DFC9] text-[#655638] transition hover:bg-[#FFF3CD]"
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <p className="text-sm font-bold text-[#302B20]">
                      {monthNames[visibleMonth.month]} {visibleMonth.year}
                    </p>

                    <button
                      type="button"
                      aria-label="Next month"
                      onClick={() => changeMonth(1)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E9DFC9] text-[#655638] transition hover:bg-[#FFF3CD]"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>

                  {/* Weekday headings */}
                  <div className="mt-4 grid grid-cols-7 gap-1 text-center">
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map(
                      (day) => (
                        <span
                          key={day}
                          className="py-2 text-xs font-bold text-[#94866B]"
                        >
                          {day}
                        </span>
                      )
                    )}
                  </div>

                  {/* Selectable days */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {calendarDays.map((day, index) => {
                      if (day === null) {
                        return (
                          <span
                            key={`empty-${index}`}
                            className="h-9"
                          />
                        );
                      }

                      const dateValue = toDateString(
                        visibleMonth.year,
                        visibleMonth.month,
                        day
                      );

                      const isSelected = dateValue === selectedDate;
                      const isToday = dateValue === getLocalDate();

                      return (
                        <button
                          key={dateValue}
                          type="button"
                          onClick={() => chooseDate(day)}
                          aria-pressed={isSelected}
                          aria-label={`${day} ${monthNames[visibleMonth.month]} ${visibleMonth.year}`}
                          className={`relative flex h-9 items-center justify-center rounded-lg text-sm transition ${
                            isSelected
                              ? "bg-[#E9B83F] font-extrabold text-[#171914] shadow-sm"
                              : "text-[#383328] hover:bg-[#FFF0BF]"
                          } ${
                            isToday && !isSelected
                              ? "font-extrabold ring-1 ring-inset ring-[#D5A329]"
                              : ""
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer actions */}
                  <div className="mt-4 flex items-center justify-between border-t border-[#EEE5D3] pt-3">
                    <button
                      type="button"
                      onClick={goToToday}
                      className="rounded-lg px-3 py-2 text-sm font-bold text-[#79570A] transition hover:bg-[#FFF3CD]"
                    >
                      Today
                    </button>

                    <button
                      type="button"
                      onClick={() => setCalendarOpen(false)}
                      className="rounded-lg bg-[#E9B83F] px-4 py-2 text-sm font-bold text-[#171914] transition hover:bg-[#D9A92F]"
                    >
                      Done
                    </button>
                  </div>
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
          iconClass="bg-[#FFF1C6] text-[#986900]"
          change="+12%"
          changeClass="text-emerald-700"
        />

        <StatCard
          title="Total Customers"
          value={formatNumber(totalCustomers)}
          icon={Users}
          iconClass="bg-[#E1F3E7] text-[#18794E]"
          change={
            customerStats?.newCustomersToday
              ? `+${customerStats.newCustomersToday}`
              : "0"
          }
          changeClass="text-emerald-700"
          changeText="new today"
        />

        <StatCard
          title="Total Products"
          value={formatNumber(totalProducts)}
          icon={Package}
          iconClass="bg-[#FFF0DB] text-[#A85B0A]"
          change={formatNumber(availableStock)}
          changeClass="text-[#A85B0A]"
          changeText="available"
        />

        <StatCard
          title="Low Stock Items"
          value={formatNumber(lowStockCount)}
          icon={AlertCircle}
          iconClass="bg-[#FCE8E6] text-[#C24136]"
          change={formatNumber(soldStock)}
          changeClass="text-[#C24136]"
          changeText="sold stock"
        />
      </div>

      {/* Charts and top products */}
      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="min-w-0 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-4 shadow-[0_4px_18px_rgba(65,48,15,0.045)] transition duration-300 hover:border-[#DCC68F] hover:shadow-md sm:p-6 xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#171914]">
                Sales Overview
              </h2>
              <p className="mt-1 text-sm text-[#777263]">
                Monthly sales performance
              </p>
            </div>

            <span className="rounded-lg border border-[#E8D59A] bg-[#FFF7DF] px-3 py-2 text-xs font-bold text-[#79570A]">
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
                  stroke="#EAE1CF"
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
                      stroke={GOLD}
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
                          fill="#FFFEFA"
                          stroke={GOLD_DARK}
                          strokeWidth="3"
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
                  className="text-[9px] font-medium text-[#918875] sm:text-[11px]"
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-5 shadow-[0_4px_18px_rgba(65,48,15,0.045)] transition duration-300 hover:border-[#DCC68F] hover:shadow-md sm:p-6">
          <div>
            <h2 className="text-lg font-bold text-[#171914]">
              Top Selling Products
            </h2>
            <p className="mt-1 text-sm text-[#777263]">
              Based on recent sales
            </p>
          </div>

          <div className="mt-6 space-y-5">
            {topProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#918875]">
                No sales available
              </div>
            ) : (
              topProducts.map((product) => (
                <div
                  key={product.id}
                  className="group flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1C6] transition group-hover:bg-[#FBE7A5]">
                    <Smartphone size={19} className="text-[#986900]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-[#29271F]">
                        {product.name}
                      </p>

                      <span className="shrink-0 text-xs text-[#777263]">
                        {product.sold} sold
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEE5D3]">
                      <div
                        className="h-full rounded-full bg-[#E9B83F] transition-all duration-500 group-hover:bg-[#D5A329]"
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
    <div className="group rounded-2xl border border-[#E6D9BD] bg-[#FFFEFA] p-5 shadow-[0_4px_18px_rgba(65,48,15,0.045)] transition-all duration-300 hover:-translate-y-1 hover:border-[#DCC68F] hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#777263]">
            {title}
          </p>

          <h2 className="mt-3 break-words text-2xl font-extrabold text-[#171914]">
            {value}
          </h2>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition duration-300 group-hover:scale-105 ${iconClass}`}
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span
          className={`flex items-center gap-1 text-xs font-bold ${changeClass}`}
        >
          <ArrowUpRight size={14} />
          {change}
        </span>

        <span className="text-xs text-[#918875]">
          {changeText || "from last week"}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
