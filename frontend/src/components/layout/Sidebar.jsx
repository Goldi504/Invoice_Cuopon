import {
  LayoutDashboard,
  Users,
  Smartphone,
  Boxes,
  ShoppingCart,
  CreditCard,
  FileText,
  MessageCircle,
  BarChart3,
  Settings,
  ChevronDown,
  Store,
  LogOut,
} from "lucide-react";

import { NavLink } from "react-router-dom";

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
    icon: Smartphone,
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
  return (
    <aside
      className="
  fixed
  left-0
  top-0
  z-40
  flex
  h-screen
  w-[250px]
  flex-col
  bg-shop-black
  text-white
"
    >
      {/* BRAND */}

      <div
        className="
          flex
          h-20
          items-center
          gap-3
          border-b
          border-white/10
          px-5
        "
      >
        <div
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-shop-gold
            text-shop-black
          "
        >
          <Store size={21} strokeWidth={2.5} />
        </div>

        <div>
          <h1 className="text-sm font-bold">Ganesh Mobile Shop</h1>

          <p className="mt-0.5 text-[11px] text-slate-400">Shop Management</p>
        </div>
      </div>

      {/* MENU */}

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p
          className="
            mb-3
            px-3
            text-[10px]
            font-semibold
            uppercase
            tracking-[0.15em]
            text-slate-500
          "
        >
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `
                  group
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  px-3
                  py-3
                  text-sm
                  transition-all
                  duration-200
                  ${
                    isActive
                      ? "bg-shop-gold text-shop-black shadow-lg shadow-shop-gold/10"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }
                  `
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />

                      <span
                        className={isActive ? "font-semibold" : "font-medium"}
                      >
                        {item.name}
                      </span>
                    </div>

                    {item.name === "Sales / POS" && (
                      <ChevronDown
                        size={15}
                        className={
                          isActive ? "text-shop-black" : "text-slate-500"
                        }
                      />
                    )}

                    {item.name === "WhatsApp" && (
                      <ChevronDown
                        size={15}
                        className={
                          isActive ? "text-shop-black" : "text-slate-500"
                        }
                      />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* USER */}

      <div
        className="
          border-t
          border-white/10
          p-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
            rounded-xl
            p-2
            hover:bg-white/5
            transition
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
              rounded-full
              bg-shop-gold
              font-bold
              text-shop-black
            "
          >
            A
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">Admin</p>

            <p className="truncate text-[11px] text-slate-500">
              admin@gmail.com
            </p>
          </div>

          <button
            className="
              text-slate-500
              transition
              hover:text-red-400
            "
            title="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
