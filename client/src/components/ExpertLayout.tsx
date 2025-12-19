
import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import TopNav from "./TopNav";

export default function ExpertLayout({ active = "dashboard" }: { active?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 min-h-screen">
          <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
