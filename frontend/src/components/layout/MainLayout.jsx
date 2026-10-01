import { useState } from "react";

import { X } from "lucide-react";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {

  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-shop-cream">

      {/* DESKTOP SIDEBAR */}

      <Sidebar />


      {/* MOBILE SIDEBAR */}

      {mobileMenu && (
        <>

          <div
            onClick={() => setMobileMenu(false)}
            className="
              fixed
              inset-0
              z-40
              bg-black/50
              lg:hidden
            "
          />

          <div
            className="
              fixed
              left-0
              top-0
              z-50
              h-screen
              w-[270px]
              lg:hidden
            "
          >

            <Sidebar />

            <button
              onClick={() => setMobileMenu(false)}
              className="
                absolute
                right-3
                top-5
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-white/10
                text-white
              "
            >
              <X size={18} />
            </button>

          </div>

        </>
      )}


      {/* MAIN AREA */}

      <div className="lg:ml-[250px]">

        <Topbar
          onMenuClick={() =>
            setMobileMenu(true)
          }
        />

        <main>
          {children}
        </main>

      </div>

    </div>
  );
}

export default MainLayout;