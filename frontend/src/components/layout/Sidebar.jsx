
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
  Menu,
  X,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", path: "/customers", icon: Users },
  { name: "Products", path: "/products", icon: Smartphone },
  { name: "Inventory", path: "/inventory", icon: Boxes },
  { name: "Sales / POS", path: "/sales", icon: ShoppingCart },
  { name: "Payments", path: "/payments", icon: CreditCard },
  { name: "Invoices", path: "/invoices", icon: FileText },
  { name: "WhatsApp", path: "/whatsapp", icon: MessageCircle },
  { name: "Reports", path: "/reports", icon: BarChart3 },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const closeMobileMenu = () => setMobileOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");

    closeMobileMenu();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile menu button */}
      <motion.button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
        whileTap={{ scale: 0.92 }}
        className="fixed left-3 top-3 z-[70] flex h-10 w-10 items-center justify-center rounded-xl border border-amber-300/20 bg-[#F8C956] text-[#101416] shadow-lg shadow-amber-500/10 transition-colors hover:bg-[#FFE69A] lg:hidden"
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </motion.button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.button
            type="button"
            aria-label="Close navigation overlay"
            onClick={closeMobileMenu}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/65 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-dvh w-[250px] flex-col
          overflow-hidden border-r border-white/[0.07]
          bg-[radial-gradient(ellipse_at_0%_0%,rgba(248,201,86,0.09),transparent_45%),linear-gradient(180deg,#151a1b_0%,#101416_100%)]
          text-white shadow-[10px_0_40px_rgba(0,0,0,0.16)]
          transition-transform duration-300 ease-out
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Brand */}
        <div className="relative flex h-20 shrink-0 items-center gap-3 border-b border-white/[0.09] px-5">
          <motion.div
            whileHover={{ rotate: 5, scale: 1.06 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FFE69A] via-[#F8C956] to-[#DCA72E] text-[#101416] shadow-lg shadow-amber-400/15"
          >
            <Store size={22} strokeWidth={2.5} />
          </motion.div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-extrabold tracking-tight text-white">
              Ganesh Mobile Shop
            </h1>
            <p className="mt-1 text-[11px] text-slate-400">
              Shop Management
            </p>
          </div>

          <button
            type="button"
            onClick={closeMobileMenu}
            aria-label="Close sidebar"
            className="ml-auto rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-[#F8C956] lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 [scrollbar-color:#39403e_transparent] [scrollbar-width:thin]">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Main Menu
          </p>

          <div className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubmenu =
                item.name === "Sales / POS" ||
                item.name === "WhatsApp";

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className="block outline-none"
                >
                  {({ isActive }) => (
                    <motion.div
                      initial={false}
                      whileHover={{ x: 4, scale: 1.015 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 24,
                      }}
                      className={`
                        group relative flex min-h-[46px] items-center
                        justify-between overflow-hidden rounded-xl
                        border px-3 py-3 text-sm
                        transition-colors duration-200
                        focus-visible:ring-2 focus-visible:ring-[#F8C956]
                        ${
                          isActive
                            ? "border-[#F8C956]/30 bg-gradient-to-r from-[#FFE69A] via-[#F8C956] to-[#E5B13B] font-semibold text-[#151714] shadow-[0_5px_22px_rgba(248,201,86,0.13)]"
                            : "border-transparent text-slate-300 hover:border-[#F8C956]/20 hover:bg-[#F8C956]/[0.09] hover:text-[#FFE69A]"
                        }
                      `}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active-indicator"
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 32,
                          }}
                          className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#101416]"
                        />
                      )}

                      {!isActive && (
                        <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F8C956]/[0.07] to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                      )}

                      <div className="relative z-10 flex min-w-0 items-center gap-3">
                        <motion.span
                          animate={{ scale: isActive ? 1.04 : 1 }}
                          className={`
                            flex h-8 w-8 shrink-0 items-center justify-center
                            rounded-lg transition-all duration-200
                            ${
                              isActive
                                ? "bg-black/[0.08] text-[#171914]"
                                : "bg-white/[0.035] text-slate-400 group-hover:bg-[#F8C956]/10 group-hover:text-[#F8C956]"
                            }
                          `}
                        >
                          <Icon
                            size={18}
                            strokeWidth={isActive ? 2.5 : 1.9}
                          />
                        </motion.span>

                        <span
                          className={
                            isActive
                              ? "font-bold"
                              : "font-medium transition-colors duration-200"
                          }
                        >
                          {item.name}
                        </span>
                      </div>

                      {hasSubmenu && (
                        <ChevronDown
                          size={15}
                          className={`relative z-10 shrink-0 transition-colors duration-200 ${
                            isActive
                              ? "text-[#171914]"
                              : "text-slate-500 group-hover:text-[#F8C956]"
                          }`}
                        />
                      )}
                    </motion.div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="shrink-0 border-t border-white/[0.09] bg-black/[0.10] p-4">
          <motion.div
            whileHover={{ backgroundColor: "rgba(248,201,86,0.06)" }}
            className="flex items-center gap-3 rounded-xl border border-transparent p-2 transition-colors"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE69A] to-[#DCA72E] font-extrabold text-[#101416] shadow-md shadow-amber-500/10">
              A
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                Admin
              </p>
              <p className="truncate text-[11px] text-slate-400">
                admin@gmail.com
              </p>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.12, x: 2 }}
              whileTap={{ scale: 0.92 }}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-400/10 hover:text-red-400"
              title="Logout"
              aria-label="Logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
            </motion.button>
          </motion.div>

          <div className="mt-3 flex items-center justify-center gap-2 text-[9px] tracking-wide text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
            SHOP MANAGEMENT SYSTEM
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;