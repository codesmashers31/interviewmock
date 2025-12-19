import { Home, User, Settings2 } from "lucide-react"; // or any React icons
import React, { useState } from "react";
import { toast } from "sonner";
import Sidebar from "../components/Sidebar";

const BottomNav = () => {
  const [showProfile, setShowProfile] = useState(false);
  return (
    <>
      {/* Main bar */}
      <nav className="fixed bottom-0 left-0 w-full h-14 bg-white border-t border-gray-200 flex justify-around items-center z-50 shadow-inner lg:hidden">
        <button className="flex flex-col items-center gap-0.5 text-blue-600" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-700" onClick={() => setShowProfile(true)}>
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </button>
        <button className="flex flex-col items-center gap-0.5 text-gray-700" onClick={() => toast.info("Settings clicked!")}>
          <Settings2 className="w-6 h-6" />
          <span className="text-xs">Settings</span>
        </button>
      </nav>
      {/* Profile Sheet (slide up) */}
      {showProfile &&
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="w-full bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-5 animate-slideUpShadow shadow-2xl">
            <button className="absolute right-5 top-4 text-xl" onClick={() => setShowProfile(false)}>✕</button>
            <Sidebar />
          </div>
        </div>
      }
      <style>{`
        @keyframes slideUpShadow {
          0% { transform: translateY(100%) scale(0.97); opacity:0 }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-slideUpShadow { animation: slideUpShadow 0.25s cubic-bezier(.3,.9,.4,1) both; }
      `}</style>
    </>
  );
};

export default BottomNav;
