import {
  Search,
  Bell,
  ChevronDown,
  Menu,
} from "lucide-react";

function Topbar({ onMenuClick }) {
  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-20
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white/95
        px-4
        backdrop-blur
        sm:px-6
        lg:px-8
      "
    >

      {/* MOBILE MENU */}

      <button
        onClick={onMenuClick}
        className="
          mr-3
          flex
          h-10
          w-10
          items-center
          justify-center
          rounded-xl
          text-slate-600
          hover:bg-slate-100
          lg:hidden
        "
      >
        <Menu size={21} />
      </button>


      {/* SEARCH */}

      <div
        className="
          hidden
          h-11
          w-full
          max-w-[420px]
          items-center
          gap-3
          rounded-xl
          border
          border-slate-200
          bg-slate-50
          px-4
          md:flex
        "
      >

        <Search
          size={18}
          className="text-slate-400"
        />

        <input
          type="text"
          placeholder="Search customers, products, invoices..."
          className="
            w-full
            bg-transparent
            text-sm
            text-slate-700
            outline-none
            placeholder:text-slate-400
          "
        />

        <span
          className="
            hidden
            rounded-md
            border
            border-slate-200
            bg-white
            px-2
            py-1
            text-[10px]
            text-slate-400
            lg:block
          "
        >
          /
        </span>

      </div>


      <div className="ml-auto flex items-center gap-3 sm:gap-5">

        {/* NOTIFICATION */}

        <button
          className="
            relative
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            text-slate-500
            transition
            hover:bg-slate-100
            hover:text-shop-black
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
              ring-2
              ring-white
            "
          />

        </button>


        {/* PROFILE */}

        <button
          className="
            flex
            items-center
            gap-2
            rounded-xl
            p-1.5
            transition
            hover:bg-slate-50
          "
        >

          <div
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-shop-gold
              text-sm
              font-bold
              text-shop-black
            "
          >
            A
          </div>

          <div className="hidden text-left sm:block">

            <p
              className="
                text-sm
                font-semibold
                text-shop-text
              "
            >
              Admin
            </p>

            <p
              className="
                text-[11px]
                text-shop-muted
              "
            >
              admin@gmail.com
            </p>

          </div>

          <ChevronDown
            size={15}
            className="text-slate-400"
          />

        </button>

      </div>

    </header>
  );
}

export default Topbar;