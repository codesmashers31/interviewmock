import ExpertStats from "../../components/ExpertStats";
// import DashboardSessions from "../../components/DashboardSessions";
// import DashboardChats from "../../components/DashboardChats";

export default function DashboardIndex() {
  return (
    <div className="h-full bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
      {/* Scrollable Container for the whole white card content if screen is too small, OR strictly fixed */}
      {/* User wants internal scrolling for lists, not the whole page. So we structure it with flex. */}

      <div className="flex-1 flex flex-col min-h-0">
        {/* 1. Top Section: Stats Cards - Fixed Height / Shrink-0 */}
        <div className="p-6 pb-2 shrink-0">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Overview</h1>
          <ExpertStats />
        </div>

        {/* 2. Main Content Grid: Sessions & Chats - Takes remaining height */}
        {/*
          Sessions and Chats sections are commented out as per requirement.
        */}
      </div>
    </div>
  );
}
