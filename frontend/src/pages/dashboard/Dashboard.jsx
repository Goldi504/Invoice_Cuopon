import {
  Bell,
  CalendarDays,
  ChevronDown,
  ShoppingCart,
  Users,
  Package,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
} from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { motion } from "framer-motion";

const salesData = [
  { month: "Jan", sales: 18000 },
  { month: "Feb", sales: 27000 },
  { month: "Mar", sales: 39000 },
  { month: "Apr", sales: 33000 },
  { month: "May", sales: 50000 },
  { month: "Jun", sales: 43000 },
  { month: "Jul", sales: 47000 },
  { month: "Aug", sales: 59000 },
  { month: "Sep", sales: 58000 },
];

const products = [
  {
    name: "iPhone 15",
    sold: 25,
    price: "₹79,900",
    image: "📱",
  },
  {
    name: "Samsung Galaxy S24",
    sold: 18,
    price: "₹64,999",
    image: "📱",
  },
  {
    name: "OnePlus 12",
    sold: 15,
    price: "₹54,999",
    image: "📱",
  },
  {
    name: "Redmi Note 13",
    sold: 12,
    price: "₹19,999",
    image: "📱",
  },
  {
    name: "Realme 12 Pro",
    sold: 10,
    price: "₹24,999",
    image: "📱",
  },
];

const stats = [
  {
    title: "Total Sales",
    value: "₹1,45,000",
    change: "+12%",
    description: "from last week",
    icon: ShoppingCart,
    type: "blue",
    positive: true,
  },
  {
    title: "Total Customers",
    value: "256",
    change: "+8%",
    description: "from last week",
    icon: Users,
    type: "green",
    positive: true,
  },
  {
    title: "Total Products",
    value: "1,120",
    change: "+5%",
    description: "from last week",
    icon: Package,
    type: "yellow",
    positive: true,
  },
  {
    title: "Low Stock Items",
    value: "42",
    change: "+18%",
    description: "from last week",
    icon: AlertCircle,
    type: "red",
    positive: false,
  },
];

function Dashboard() {
  return (
    <div className="min-h-screen bg-shop-cream">

      {/* =====================================================
          TOP HEADER
      ====================================================== */}

      <header
        className="
          h-20
          bg-white
          border-b
          border-slate-200
          flex
          items-center
          justify-between
          px-6
          lg:px-8
          sticky
          top-0
          z-30
        "
      >

        {/* Search */}

        <div
          className="
            hidden
            md:flex
            items-center
            w-[360px]
            h-11
            rounded-xl
            bg-slate-50
            border
            border-slate-200
            px-4
          "
        >
          <span className="text-sm text-slate-400">
            Search customers, products, invoices...
          </span>
        </div>

        <div className="flex items-center gap-5 ml-auto">

          {/* Notification */}

          <button
            className="
              relative
              h-10
              w-10
              rounded-xl
              flex
              items-center
              justify-center
              text-slate-500
              hover:bg-slate-100
              transition
            "
          >
            <Bell size={19} />

            <span
              className="
                absolute
                right-2
                top-2
                h-2
                w-2
                rounded-full
                bg-red-500
              "
            />
          </button>

          {/* User */}

          <div className="flex items-center gap-3">

            <div
              className="
                h-10
                w-10
                rounded-full
                bg-shop-gold
                flex
                items-center
                justify-center
                font-bold
                text-shop-black
              "
            >
              A
            </div>

            <div className="hidden sm:block">

              <p
                className="
                  text-sm
                  font-semibold
                  text-shop-text
                "
              >
                Admin
              </p>

              <p className="text-xs text-shop-muted">
                admin@gmail.com
              </p>

            </div>

            <ChevronDown
              size={16}
              className="text-slate-400"
            />

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="p-6 lg:p-8">

        {/* PAGE HEADER */}

        <div
          className="
            flex
            flex-col
            md:flex-row
            md:items-center
            md:justify-between
            gap-5
            mb-7
          "
        >

          <div>

            <h1
              className="
                text-3xl
                font-extrabold
                text-shop-text
              "
            >
              Dashboard
            </h1>

            <p
              className="
                mt-1
                text-sm
                text-shop-muted
              "
            >
              Good morning, Admin! Here's what's happening today.
            </p>

          </div>


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
              text-shop-text
              shadow-sm
              hover:border-shop-gold
              transition
            "
          >

            <CalendarDays size={17} />

            30 Sep 2026

            <ChevronDown size={16} />

          </button>

        </div>


        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-5
          "
        >

          {stats.map((stat, index) => {

            const Icon = stat.icon;

            const bgClasses = {
              blue: "bg-blue-50",
              green: "bg-emerald-50",
              yellow: "bg-amber-50",
              red: "bg-red-50",
            };

            const iconClasses = {
              blue: "text-blue-600",
              green: "text-emerald-600",
              yellow: "text-amber-600",
              red: "text-red-600",
            };

            return (
              <motion.div
                key={stat.title}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: index * 0.08,
                }}
                whileHover={{
                  y: -4,
                }}
                className="
                  bg-white
                  rounded-2xl
                  border
                  border-slate-200
                  p-5
                  shadow-sm
                  hover:shadow-card
                  transition
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

                    <p className="text-sm text-shop-muted">
                      {stat.title}
                    </p>

                    <h2
                      className="
                        mt-2
                        text-2xl
                        font-extrabold
                        text-shop-text
                      "
                    >
                      {stat.value}
                    </h2>

                  </div>

                  <div
                    className={`
                      h-11
                      w-11
                      rounded-xl
                      flex
                      items-center
                      justify-center
                      ${bgClasses[stat.type]}
                    `}
                  >
                    <Icon
                      size={20}
                      className={iconClasses[stat.type]}
                    />
                  </div>

                </div>


                <div className="mt-4 flex items-center gap-2">

                  <span
                    className={`
                      flex
                      items-center
                      gap-1
                      text-xs
                      font-semibold
                      ${
                        stat.positive
                          ? "text-emerald-600"
                          : "text-red-600"
                      }
                    `}
                  >

                    {stat.positive ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}

                    {stat.change}

                  </span>

                  <span
                    className="
                      text-xs
                      text-shop-muted
                    "
                  >
                    {stat.description}
                  </span>

                </div>

              </motion.div>
            );
          })}

        </div>


        {/* =====================================================
            CHART + PRODUCTS
        ====================================================== */}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            xl:grid-cols-[1.6fr_1fr]
            gap-6
          "
        >

          {/* SALES CHART */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.35,
            }}
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                    text-shop-text
                  "
                >
                  Sales Overview
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-shop-muted
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
                  hover:border-shop-gold
                  transition
                "
              >
                This Month
                <ChevronDown size={14} />
              </button>

            </div>


            <div className="h-[310px]">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <LineChart
                  data={salesData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="month"
                    tick={{
                      fontSize: 12,
                      fill: "#64748b",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) =>
                      `${value / 1000}K`
                    }
                  />

                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                    }}
                  />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{
                      r: 4,
                      fill: "#2563eb",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  />

                </LineChart>

              </ResponsiveContainer>

            </div>

          </motion.div>


          {/* TOP PRODUCTS */}

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.45,
            }}
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-6
              shadow-sm
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                mb-5
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                    text-shop-text
                  "
                >
                  Top Selling Products
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-shop-muted
                  "
                >
                  Best performing products
                </p>

              </div>

              <button
                className="
                  text-xs
                  font-semibold
                  text-shop-black
                  hover:text-shop-gold
                  transition
                "
              >
                View All
              </button>

            </div>


            <div className="space-y-4">

              {products.map((product, index) => (

                <motion.div
                  key={product.name}
                  whileHover={{
                    x: 4,
                  }}
                  className="
                    flex
                    items-center
                    gap-3
                    group
                  "
                >

                  {/* PRODUCT IMAGE */}

                  <div
                    className="
                      h-11
                      w-11
                      rounded-xl
                      bg-slate-100
                      flex
                      items-center
                      justify-center
                      text-xl
                    "
                  >
                    {product.image}
                  </div>


                  {/* DETAILS */}

                  <div className="flex-1 min-w-0">

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                      "
                    >

                      <p
                        className="
                          truncate
                          text-sm
                          font-semibold
                          text-shop-text
                        "
                      >
                        {product.name}
                      </p>

                      <span
                        className="
                          whitespace-nowrap
                          text-xs
                          font-semibold
                          text-shop-muted
                        "
                      >
                        {product.sold} sold
                      </span>

                    </div>


                    {/* PROGRESS */}

                    <div
                      className="
                        mt-2
                        h-1.5
                        w-full
                        rounded-full
                        bg-slate-100
                        overflow-hidden
                      "
                    >

                      <motion.div
                        initial={{
                          width: 0,
                        }}
                        animate={{
                          width: `${product.sold * 3.5}%`,
                        }}
                        transition={{
                          delay: 0.5 + index * 0.1,
                          duration: 0.7,
                        }}
                        className="
                          h-full
                          rounded-full
                          bg-shop-gold
                        "
                      />

                    </div>

                  </div>

                </motion.div>

              ))}

            </div>


            <button
              className="
                mt-5
                flex
                w-full
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-shop-black
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-shop-dark
              "
            >
              View All Products
              <ArrowUpRight size={16} />
            </button>

          </motion.div>

        </div>


        {/* =====================================================
            QUICK SUMMARY
        ====================================================== */}

        <div
          className="
            mt-6
            rounded-2xl
            border
            border-shop-gold/20
            bg-shop-black
            p-6
            text-white
            overflow-hidden
            relative
          "
        >

          {/* GOLD GLOW */}

          <div
            className="
              absolute
              -right-20
              -top-20
              h-48
              w-48
              rounded-full
              bg-shop-gold/10
              blur-3xl
            "
          />

          <div
            className="
              relative
              flex
              flex-col
              md:flex-row
              md:items-center
              md:justify-between
              gap-5
            "
          >

            <div>

              <p
                className="
                  text-xs
                  uppercase
                  tracking-wider
                  text-shop-gold
                "
              >
                Shop Performance
              </p>

              <h3
                className="
                  mt-2
                  text-xl
                  font-bold
                "
              >
                Your shop is growing steadily.
              </h3>

              <p
                className="
                  mt-1
                  text-sm
                  text-slate-400
                "
              >
                Keep your inventory updated and monitor
                low-stock products regularly.
              </p>

            </div>

            <button
              className="
                flex
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-shop-gold
                px-5
                py-3
                text-sm
                font-bold
                text-shop-black
                transition
                hover:scale-[1.02]
                active:scale-[0.98]
              "
            >
              View Reports
              <ArrowUpRight size={17} />
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;