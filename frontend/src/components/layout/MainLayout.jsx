import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F7F7F5]">

      <Sidebar />

      <div className="ml-[250px] min-h-screen">

        <Topbar />

        <main className="p-6">
          {children}
        </main>

      </div>

    </div>
  );
}

export default MainLayout;