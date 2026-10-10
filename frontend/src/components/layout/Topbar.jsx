
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

  // Close the profile menu when clicking outside
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
    // Clear locally stored authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");

    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[86px] min-w-0 items-center justify-between gap-3 border-b border-[#E5E7EB] bg-white px-4 sm:px-6 lg:px-8">
      {/* Search */}
      <div className="flex h-12 min-w-0 w-full max-w-[450px] items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-3 sm:px-4">
        <Search size={19} className="shrink-0 text-[#8FA3BA]" />

        <input
          type="text"
          placeholder="Search customers, products, invoices..."
          aria-label="Search customers, products, and invoices"
          className="w-full min-w-0 bg-transparent text-sm text-[#11161A] outline-none placeholder:text-[#8FA3BA]"
        />

        <span className="hidden rounded-md border border-[#E2E8F0] bg-white px-2 py-1 text-xs text-[#8FA3BA] sm:block">
          /
        </span>
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
        {/* Notification */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-xl p-2 text-[#60758F] transition hover:bg-[#FFF8E5]"
        >
          <Bell size={21} />

          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>

        {/* Admin profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            onClick={() => setProfileOpen((open) => !open)}
            className="flex items-center gap-2 rounded-xl px-2 py-2 transition hover:bg-[#F8FAFC] sm:gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2C94C] font-bold text-[#11161A] sm:h-11 sm:w-11">
              A
            </div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold text-[#11161A]">
                Admin
              </p>

              <p className="text-xs text-[#6B84A3]">
                admin@gmail.com
              </p>
            </div>

            <ChevronDown
              size={17}
              className={`text-[#8FA3BA] transition-transform ${
                profileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white p-2 shadow-xl"
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
