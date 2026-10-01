import {
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-7">

      {/* SEARCH */}
      <div className="flex h-10 w-[390px] items-center gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-400">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search customers, products, invoices..."
          className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400"
        />

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-5">

        {/* NOTIFICATION */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100">

          <Bell size={19} />

          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
            2
          </span>

        </button>

        {/* PROFILE */}
        <div className="flex cursor-pointer items-center gap-2.5">

          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f5d58a] text-xs font-bold text-slate-900">
            A
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-800">
              Admin
            </p>

            <p className="text-[10px] text-slate-500">
              admin@gmail.com
            </p>
          </div>

          <ChevronDown
            size={15}
            className="text-slate-400"
          />

        </div>

      </div>

    </header>
  );
}

export default Header;