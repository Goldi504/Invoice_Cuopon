import {
  LayoutDashboard,
  Users,
  Package,
  Boxes,
  ShoppingCart,
  CreditCard,
  FileText,
  MessageCircle,
  BarChart3,
  Settings,
  Store,
  LogOut,
  ChevronRight,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Customers",
    path: "/customers",
    icon: Users,
  },
  {
    name: "Products",
    path: "/products",
    icon: Package,
  },
  {
    name: "Inventory",
    path: "/inventory",
    icon: Boxes,
  },
  {
    name: "Sales / POS",
    path: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Payments",
    path: "/payments",
    icon: CreditCard,
  },
  {
    name: "Invoices",
    path: "/invoices",
    icon: FileText,
  },
  {
    name: "WhatsApp",
    path: "/whatsapp",
    icon: MessageCircle,
  },
  {
    name: "Reports",
    path: "/reports",
    icon: BarChart3,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[250px] flex-col bg-slate-950 text-white">

      {/* LOGO */}
      <div className="flex h-[82px] items-center gap-3 border-b border-white/10 px-5">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5d58a] text-slate-900">
          <Store size={20} />
        </div>

        <div>
          <h2 className="text-sm font-bold">
            Ganesh Mobile Shop
          </h2>

          <p className="mt-0.5 text-[10px] text-slate-400">
            Shop Management System
          </p>
        </div>

      </div>

      {/* MENU */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `group mb-1 flex items-center gap-3 rounded-lg px-3 py-3 text-[13px] font-medium transition ${
                  isActive
                    ? "bg-[#f5d58a] font-semibold text-slate-900 shadow-sm"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >

              <Icon size={18} />

              <span className="flex-1">
                {item.name}
              </span>

              <ChevronRight
                size={15}
                className="opacity-40"
              />

            </NavLink>
          );
        })}

      </nav>

      {/* USER */}
      <div className="border-t border-white/10 p-4">

        <div className="mb-3 flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5d58a] text-sm font-bold text-slate-900">
            A
          </div>

          <div className="min-w-0">
            <p className="text-xs font-semibold">
              Admin
            </p>

            <p className="truncate text-[10px] text-slate-400">
              admin@gmail.com
            </p>
          </div>

        </div>

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-800 px-3 py-2.5 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <LogOut size={16} />

          Logout
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;