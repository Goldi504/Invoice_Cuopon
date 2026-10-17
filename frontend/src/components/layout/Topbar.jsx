
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  ChevronDown,
  LogOut,
  UserRound,
} from "lucide-react";

function Topbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("user");

    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[68px] w-full min-w-0 items-center gap-2 border-b border-[#E8DFC9] bg-[#FFFEFA] pl-14 pr-3 shadow-[0_2px_10px_rgba(65,48,15,0.035)] sm:h-[76px] sm:gap-4 sm:px-5 lg:h-[86px] lg:gap-6 lg:px-8">
      {/* Search */}
      <div className="min-w-0 flex-1 lg:flex-none">
        <div className="flex h-9 w-full min-w-0 items-center gap-2 rounded-xl border border-[#E9DFC9] bg-[#F8F6F0] px-2.5 transition focus-within:border-[#D5A329] focus-within:ring-2 focus-within:ring-[#F2C94C]/20 sm:h-10 sm:max-w-[280px] lg:h-11 lg:w-[360px] lg:max-w-none lg:gap-3 lg:px-4">
          <Search
            size={18}
            className="shrink-0 text-[#9A8B6B]"
          />

          <input
            type="search"
            placeholder="Search..."
            aria-label="Search customers, products, and invoices"
            className="w-full min-w-0 bg-transparent text-xs text-[#29271F] outline-none placeholder:text-[#9A907D] sm:text-sm"
          />

          <span className="hidden shrink-0 rounded-md border border-[#E9DFC9] bg-[#FFFEFA] px-2 py-1 text-xs text-[#9A907D] lg:block">
            /
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-3 lg:gap-5">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#776747] transition hover:bg-[#FFF4D1] hover:text-[#8B650D] sm:h-10 sm:w-10"
        >
          <Bell size={19} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#FFFEFA]" />
        </button>

        {/* Admin profile */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Open admin profile menu"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-1 rounded-xl p-1 transition hover:bg-[#F8F1DF] sm:gap-2 sm:px-2 sm:py-1.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE69A] to-[#E9B83F] text-sm font-extrabold text-[#171914] shadow-sm sm:h-10 sm:w-10 lg:h-11 lg:w-11">
              A
            </div>

            <div className="hidden min-w-0 text-left md:block">
              <p className="text-sm font-bold text-[#25231D]">
                Admin
              </p>

              <p className="max-w-[145px] truncate text-xs text-[#8A7A5D]">
                admin@gmail.com
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`shrink-0 text-[#9A8B6B] transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-[min(260px,calc(100vw-24px))] overflow-hidden rounded-2xl border border-[#E9DFC9] bg-[#FFFEFA] p-2 shadow-[0_16px_45px_rgba(35,29,16,0.16)]"
            >
              <div className="flex items-center gap-3 rounded-xl border-b border-[#EEE5D3] px-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#FFE69A] to-[#E9B83F] font-extrabold text-[#171914]">
                  A
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#25231D]">
                    Admin
                  </p>

                  <p className="break-all text-xs text-[#8A7A5D]">
                    admin@gmail.com
                  </p>
                </div>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
                className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-[#514A3B] transition hover:bg-[#FFF4D1] hover:text-[#78570B]"
              >
                <UserRound size={17} />
                Profile & Settings
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
