import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {
  return (
    <div className="min-h-dvh w-full min-w-0 overflow-x-clip bg-[#F7F7F5]">
      <Sidebar />

      <div className="ml-0 flex min-h-dvh min-w-0 flex-col lg:ml-[250px]">
        <Topbar />

        <main className="w-full min-w-0 flex-1 p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default MainLayout;