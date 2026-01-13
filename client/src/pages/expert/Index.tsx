// src/pages/expert/Index.tsx

import ExpertStats from "../../components/ExpertStats";
import DashboardSessions from "../../components/DashboardSessions";
import DashboardChats from "../../components/DashboardChats";

export default function DashboardIndex() {
  return (
    <div className="p-0 bg-transparent space-y-8">
      {/* 1. Top Section: Stats Cards */}
      <section>
        <h1 className="text-2xl font-black text-gray-900 mb-6 px-1">Overview</h1>
        <ExpertStats />
      </section>

      {/* 2. Main Content Grid: Sessions & Chats */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Left Column: Recent Sessions (Takes up 2/3 space on large screens) */}
        <div className="xl:col-span-2">
          <DashboardSessions />
        </div>

        {/* Right Column: Chats / Messages (Takes up 1/3 space) */}
        <div className="xl:col-span-1">
          <DashboardChats />
        </div>

      </section>
    </div>
  );
}
