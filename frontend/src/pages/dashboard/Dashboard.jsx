import {
  IndianRupee,
  Users,
  Package,
  AlertTriangle,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

const stats = [
  {
    title: "Total Sales",
    value: "₹1,45,000",
    change: "+12% from last week",
    icon: IndianRupee,
    color: "blue",
  },
  {
    title: "Total Customers",
    value: "256",
    change: "+8% from last week",
    icon: Users,
    color: "green",
  },
  {
    title: "Total Products",
    value: "1,120",
    change: "+5% from last week",
    icon: Package,
    color: "orange",
  },
  {
    title: "Low Stock Items",
    value: "42",
    change: "+18% from last week",
    icon: AlertTriangle,
    color: "red",
  },
];

function Dashboard() {
  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Good morning, Admin! Here's what's happening today.
          </p>
        </div>

        <button className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
          30 Sep 2026
        </button>

      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon;

          const styles = {
            blue: {
              card: "border-blue-100 bg-blue-50",
              icon: "bg-blue-100 text-blue-600",
              value: "text-blue-950",
              change: "text-blue-600",
            },

            green: {
              card: "border-green-100 bg-green-50",
              icon: "bg-green-100 text-green-600",
              value: "text-green-950",
              change: "text-green-600",
            },

            orange: {
              card: "border-orange-100 bg-orange-50",
              icon: "bg-orange-100 text-orange-600",
              value: "text-orange-950",
              change: "text-orange-600",
            },

            red: {
              card: "border-red-100 bg-red-50",
              icon: "bg-red-100 text-red-600",
              value: "text-red-950",
              change: "text-red-600",
            },
          };

          const style = styles[stat.color];

          return (
            <div
              key={stat.title}
              className={`rounded-xl border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${style.card}`}
            >

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[11px] font-semibold text-slate-600">
                    {stat.title}
                  </p>

                  <h2
                    className={`mt-2 text-2xl font-extrabold ${style.value}`}
                  >
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg ${style.icon}`}
                >
                  <Icon size={18} />
                </div>

              </div>

              <p
                className={`mt-4 text-[10px] font-semibold ${style.change}`}
              >
                {stat.change}
              </p>

            </div>
          );
        })}

      </div>

      {/* MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">

        {/* SALES OVERVIEW */}
        <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Sales Overview
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Monthly sales performance
              </p>
            </div>

            <select className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>

          </div>

          {/* CHART PLACEHOLDER */}
          <div className="flex h-[280px] items-center justify-center rounded-lg bg-slate-50">

            <div className="text-center">

              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <TrendingUp size={23} />
              </div>

              <p className="text-sm font-semibold text-slate-700">
                Sales Chart
              </p>

              <p className="mt-1 text-xs text-slate-400">
                We will connect Recharts with your backend next.
              </p>

            </div>

          </div>

        </div>

        {/* TOP SELLING */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex items-center justify-between">

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Top Selling Products
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Best performing products
              </p>
            </div>

            <button className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">
              View All
            </button>

          </div>

          <div className="space-y-4">

            {[
              ["iPhone 15", "25 sold"],
              ["Samsung Galaxy S24", "18 sold"],
              ["OnePlus 12", "15 sold"],
              ["Redmi Note 13", "12 sold"],
              ["Realme 12 Pro", "10 sold"],
            ].map(([name, sold], index) => (
              <div
                key={name}
                className="flex items-center gap-3"
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <ShoppingCart
                    size={16}
                    className="text-slate-500"
                  />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between">

                    <p className="truncate text-xs font-semibold text-slate-700">
                      {name}
                    </p>

                    <span className="text-[10px] font-semibold text-slate-500">
                      {sold}
                    </span>

                  </div>

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">

                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{
                        width: `${100 - index * 15}%`,
                      }}
                    />

                  </div>

                </div>

              </div>
            ))}

          </div>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;