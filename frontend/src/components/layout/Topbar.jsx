import {
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

function Topbar() {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-[86px]
        items-center
        justify-between
        border-b
        border-[#E5E7EB]
        bg-white
        px-8
      "
    >

      {/* Search */}
      <div
        className="
          flex
          h-12
          w-[450px]
          items-center
          gap-3
          rounded-xl
          border
          border-[#E2E8F0]
          bg-[#F8FAFC]
          px-4
        "
      >

        <Search
          size={19}
          className="text-[#8FA3BA]"
        />

        <input
          type="text"
          placeholder="Search customers, products, invoices..."
          className="
            w-full
            bg-transparent
            text-sm
            text-[#11161A]
            outline-none
            placeholder:text-[#8FA3BA]
          "
        />

        <span
          className="
            rounded-md
            border
            border-[#E2E8F0]
            bg-white
            px-2
            py-1
            text-xs
            text-[#8FA3BA]
          "
        >
          /
        </span>

      </div>

      {/* Right */}
      <div className="flex items-center gap-6">

        {/* Notification */}
        <button
          className="
            relative
            rounded-xl
            p-2
            text-[#60758F]
            transition
            hover:bg-[#FFF8E5]
          "
        >
          <Bell size={21} />

          <span
            className="
              absolute
              right-1
              top-1
              h-2
              w-2
              rounded-full
              bg-red-500
            "
          />
        </button>

        {/* Admin */}
        <button
          className="
            flex
            items-center
            gap-3
            rounded-xl
            px-2
            py-2
            transition
            hover:bg-[#F8FAFC]
          "
        >

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#F2C94C]
              font-bold
              text-[#11161A]
            "
          >
            A
          </div>

          <div className="text-left">

            <p className="text-sm font-bold text-[#11161A]">
              Admin
            </p>

            <p className="text-xs text-[#6B84A3]">
              admin@gmail.com
            </p>

          </div>

          <ChevronDown
            size={17}
            className="text-[#8FA3BA]"
          />

        </button>

      </div>

    </header>
  );
}

export default Topbar;