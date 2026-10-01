import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <div className="ml-[250px] min-h-screen">

        <Header />

        <main className="p-6">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;