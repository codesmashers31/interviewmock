
import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import TopNav from "./TopNav";

export default function ExpertLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 lg:p-6 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
