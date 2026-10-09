import React, { useEffect, useMemo, useState } from "react";

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
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatMoney = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
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

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async (refresh = false) => {
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

      // -------------------------------
      // SUMMARY
      // -------------------------------

      setSummary(summaryResponse?.summary || {});

      // -------------------------------
      // TODAY SALES
      // -------------------------------

      setTodaySales(todayResponse || {});

      // -------------------------------
      // RECENT SALES
      // -------------------------------

      setRecentSales(recentResponse?.sales || []);

      // -------------------------------
      // STOCK
      // -------------------------------

      setStockSummary(stockResponse?.stock || []);

      // -------------------------------
      // CUSTOMERS
      // -------------------------------

      setCustomerStats(customerResponse?.customers || {});

      // -------------------------------
      // MONTHLY SALES
      // -------------------------------

      setMonthlySales(monthlyResponse?.monthlySales || []);
    } catch (err) {
      console.error("Dashboard loading error:", err);

      setError(err?.response?.data?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // REAL BACKEND VALUES
  // =====================================================

  const totalCustomers = summary?.totalCustomers || 0;

  const availableStock = summary?.availableStock || 0;

  const soldStock = summary?.soldStock || 0;

  const totalSales = summary?.totalSales || 0;

  const totalRevenue = summary?.totalRevenue || 0;

  // =====================================================
  // TOTAL INVENTORY
  //
  // Your backend gives availableStock + soldStock.
  // =====================================================

  const totalProducts = Number(availableStock) + Number(soldStock);

  // =====================================================
  // STOCK
  // =====================================================

  const lowStockCount =
    stockSummary.find((item) => item._id === "LOW_STOCK")?.count || 0;

  // =====================================================
  // TOP PRODUCTS
  //
  // Your current backend does NOT have a top-product
  // endpoint.
  //
  // For now we derive product sales from recent sales.
  // =====================================================

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

  // =====================================================
  // CHART DATA
  // =====================================================

  const chartData = useMemo(() => {
    const data = Array.from({ length: 12 }, (_, index) => {
      const found = monthlySales.find((item) => item?._id?.month === index + 1);

      return {
        month: monthNames[index],
        revenue: found?.revenue || 0,
      };
    });

    return data;
  }, [monthlySales]);

  // =====================================================
  // MAX CHART VALUE
  // =====================================================

  const maxRevenue = Math.max(...chartData.map((item) => item.revenue), 1);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-9 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="
                h-36
                animate-pulse
                rounded-2xl
                bg-white
              "
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div
            className="
              h-[420px]
              animate-pulse
              rounded-2xl
              bg-white
              xl:col-span-2
            "
          />

          <div
            className="
              h-[420px]
              animate-pulse
              rounded-2xl
              bg-white
            "
          />
        </div>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-14
              w-14
              items-center
              justify-center
              rounded-2xl
              bg-red-50
            "
          >
            <AlertCircle size={25} className="text-red-500" />
          </div>

          <h2
            className="
              mt-4
              text-lg
              font-bold
              text-slate-950
            "
          >
            Dashboard could not load
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
            "
          >
            {error}
          </p>

          <button
            onClick={() => loadDashboard()}
            className="
              mt-5
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#F4C64E]
              px-5
              py-3
              text-sm
              font-bold
              text-slate-950
              transition-all
              duration-300
              hover:-translate-y-1
              hover:bg-[#E9B52F]
              hover:shadow-lg
            "
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-3xl
              font-bold
              tracking-tight
              text-slate-950
            "
          >
            Dashboard
          </h1>

          <p
            className="
              mt-1
              text-sm
              text-slate-500
            "
          >
            Good morning, Admin! Here's what's happening today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* REFRESH */}

          <button
            onClick={() => loadDashboard(true)}
            disabled={refreshing}
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              bg-white
              text-slate-500
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:text-slate-900
              hover:shadow-md
            "
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          </button>

          {/* DATE */}

          <button
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              py-3
              text-sm
              font-medium
              text-slate-700
              shadow-sm
              transition-all
              duration-300
              hover:-translate-y-1
              hover:border-[#F4C64E]
              hover:shadow-md
            "
          >
            <CalendarDays size={17} />
            30 Sep 2026
            <ChevronDown size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* =================================================
          STAT CARDS
      ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {/* SALES */}

        <StatCard
          title="Total Sales"
          value={formatMoney(totalRevenue)}
          icon={ShoppingCart}
          iconClass="bg-blue-50 text-blue-600"
          change="+12%"
          changeClass="text-emerald-600"
        />

        {/* CUSTOMERS */}

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

        {/* PRODUCTS */}

        <StatCard
          title="Total Products"
          value={formatNumber(totalProducts)}
          icon={Package}
          iconClass="bg-amber-50 text-amber-600"
          change={formatNumber(availableStock)}
          changeClass="text-amber-600"
          changeText="available"
        />

        {/* LOW STOCK */}

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

      {/* =================================================
          SALES + TOP PRODUCTS
      ================================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-6
          xl:grid-cols-3
        "
      >
        {/* =================================================
            SALES OVERVIEW
        ================================================= */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
            xl:col-span-2
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-950
                "
              >
                Sales Overview
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Monthly sales performance
              </p>
            </div>

            <button
              className="
                flex
                items-center
                gap-2
                rounded-lg
                border
                border-slate-200
                px-3
                py-2
                text-xs
                font-medium
                text-slate-600
                transition-all
                duration-300
                hover:border-[#F4C64E]
                hover:bg-[#FFF9E8]
              "
            >
              This Year
              <ChevronDown size={14} />
            </button>
          </div>

          {/* CHART */}

          <div className="mt-8 h-[300px]">
            <svg
              viewBox="0 0 800 300"
              className="h-full w-full"
              preserveAspectRatio="none"
            >
              {/* GRID */}

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

              {/* GRAPH */}

              {(() => {
                const points = chartData.map((item, index) => {
                  const x =
                    chartData.length === 1 ? 400 : 45 + (index * 730) / 11;

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

                      const y = 255 - (item.revenue / maxRevenue) * 205;

                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="5"
                          fill="white"
                          stroke="#2563EB"
                          strokeWidth="4"
                          className="
                              transition-all
                              duration-300
                              hover:r-8
                            "
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* MONTHS */}

            <div
              className="
                mt-2
                flex
                justify-between
                px-8
              "
            >
              {chartData.map((item) => (
                <span
                  key={item.month}
                  className="
                      text-[11px]
                      text-slate-400
                    "
                >
                  {item.month}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* =================================================
            TOP SELLING PRODUCTS
        ================================================= */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-6
            shadow-sm
            transition-all
            duration-300
            hover:-translate-y-1
            hover:shadow-lg
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-bold
                  text-slate-950
                "
              >
                Top Selling Products
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-500
                "
              >
                Based on recent completed sales
              </p>
            </div>

            <button
              className="
                text-sm
                font-semibold
                text-slate-950
                transition
                hover:text-[#D99E00]
              "
            >
              View All
            </button>
          
          </div>

          <div className="mt-6 space-y-5">
            {topProducts.length === 0 ? (
              <div
                className="
                  py-12
                  text-center
                  text-sm
                  text-slate-400
                "
              >
                No sales available
              </div>
            ) : (
              topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="
                      group
                      flex
                      items-center
                      gap-3
                    "
                >
                  <div
                    className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-slate-50
                        transition-all
                        duration-300
                        group-hover:scale-110
                        group-hover:bg-blue-50
                      "
                  >
                    <Smartphone size={19} className="text-blue-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div
                      className="
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                    >
                      <p
                        className="
                            truncate
                            text-sm
                            font-semibold
                            text-slate-900
                          "
                      >
                        {product.name}
                      </p>

                      <span
                        className="
                            shrink-0
                            text-xs
                            text-slate-500
                          "
                      >
                        {product.sold} sold
                      </span>
                    </div>

                    <div
                      className="
                          mt-2
                          h-1.5
                          overflow-hidden
                          rounded-full
                          bg-slate-100
                        "
                    >
                      <div
                        className="
                            h-full
                            rounded-full
                            bg-[#F4C64E]
                            transition-all
                            duration-500
                            group-hover:bg-[#E9B52F]
                          "
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
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

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
    <div
      className="
        group
        rounded-2xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
      "
    >
      <div
        className="
          flex
          items-start
          justify-between
        "
      >
        <div>
          <p
            className="
              text-sm
              text-slate-500
            "
          >
            {title}
          </p>

          <h2
            className="
              mt-3
              text-2xl
              font-bold
              text-slate-950
            "
          >
            {value}
          </h2>
        </div>

        <div
          className={`
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            transition-all
            duration-300
            group-hover:scale-110
            group-hover:rotate-3
            ${iconClass}
          `}
        >
          <Icon size={21} />
        </div>
      </div>

      <div
        className="
          mt-5
          flex
          items-center
          gap-2
        "
      >
        <span
          className={`
            flex
            items-center
            gap-1
            text-xs
            font-bold
            ${changeClass}
          `}
        >
          <ArrowUpRight size={14} />

          {change}
        </span>

        <span
          className="
            text-xs
            text-slate-400
          "
        >
          {changeText || "from last week"}
        </span>
      </div>
    </div>
  );
}

export default Dashboard;
