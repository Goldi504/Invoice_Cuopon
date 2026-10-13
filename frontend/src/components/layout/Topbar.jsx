
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
    <header className="sticky top-0 z-30 flex h-[68px] w-full min-w-0 items-center gap-2 border-b border-[#E5E7EB] bg-white pl-14 pr-3 sm:h-[76px] sm:gap-4 sm:px-5 lg:h-[86px] lg:gap-6 lg:px-8">
      {/* Search: compact on mobile, fixed width on desktop */}
      <div className="min-w-0 flex-1 lg:flex-none">
        <div className="flex h-9 w-full min-w-0 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 transition focus-within:border-[#F2C94C] focus-within:ring-2 focus-within:ring-amber-100 sm:h-10 sm:max-w-[280px] lg:h-12 lg:w-[360px] lg:max-w-none lg:gap-3 lg:px-4">
          <Search
            size={18}
            className="shrink-0 text-[#8FA3BA]"
          />

          <input
            type="search"
            placeholder="Search..."
            aria-label="Search customers, products, and invoices"
            className="w-full min-w-0 bg-transparent text-xs text-[#11161A] outline-none placeholder:text-[#8FA3BA] sm:text-sm"
          />

          <span className="hidden shrink-0 rounded-md border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#8FA3BA] lg:block">
            /
          </span>
        </div>
      </div>

      {/* Right side: always pushed to the right */}
      <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-3 lg:gap-5">
        {/* Notifications */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#60758F] transition hover:bg-[#FFF8E5] sm:h-10 sm:w-10"
        >
          <Bell size={19} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Admin profile */}
        <div className="relative shrink-0" ref={profileRef}>
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Open admin profile menu"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-1 rounded-xl p-1 transition hover:bg-[#F8FAFC] sm:gap-2 sm:px-2 sm:py-1.5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2C94C] text-sm font-bold text-[#11161A] sm:h-10 sm:w-10 lg:h-11 lg:w-11">
              A
            </div>

            <div className="hidden min-w-0 text-left md:block">
              <p className="text-sm font-bold text-[#11161A]">
                Admin
              </p>
              <p className="max-w-[145px] truncate text-xs text-[#6B84A3]">
                admin@gmail.com
              </p>
            </div>

            <ChevronDown
              size={16}
              className={`shrink-0 text-[#8FA3BA] transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile dropdown */}
          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-[min(240px,calc(100vw-24px))] overflow-hidden rounded-xl border border-gray-100 bg-white p-2 shadow-xl"
            >
              <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2C94C] font-bold text-[#11161A]">
                  A
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900">
                    Admin
                  </p>
                  <p className="break-all text-xs text-gray-500">
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
                className="mt-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <UserRound size={17} />
                Profile & Settings
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
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
