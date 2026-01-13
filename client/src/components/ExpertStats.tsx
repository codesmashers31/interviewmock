


import { useEffect, useState } from "react";
import axios from "axios";

// Hardcoded API URL for consistency
const API_URL = "http://localhost:3000/api";

const ExpertStats = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    todaysBookings: 0,
    revenue: 0,
    rating: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/expert/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch expert stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Professional Stats Card - STRICTLY STATIC
  interface StatCardProps {
    title: string;
    value: string | number;
    sub?: string;
    icon: React.ReactNode;
    trend?: number;
  }

  function StatCard({ title, value, sub, icon, trend }: StatCardProps) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-full">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gray-50 text-gray-700 border border-gray-100">
            {icon}
          </div>
          {trend && (
            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${trend > 0 ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-bold text-gray-900">{loading ? "-" : value}</h2>
            {sub && (
              <span className="text-gray-400 text-xs font-medium bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                {sub}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Professional Icons - Static
  const icons = {
    sessions: (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    upcoming: (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    today: (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    rating: (
      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  };

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sessions"
          value={stats.totalSessions}
          sub="All time"
          icon={icons.sessions}
        />
        <StatCard
          title="Upcoming Sessions"
          value={stats.upcomingSessions}
          sub="Next 7 days"
          icon={icons.upcoming}
        />
        <StatCard
          title="Today's Bookings"
          value={stats.todaysBookings}
          sub="Action required"
          icon={icons.today}
        />
        <StatCard
          title="Overall Rating"
          value={stats.rating}
          sub="Out of 5.0"
          icon={icons.rating}
        />
      </div>

      {/* Additional Professional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Revenue Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">₹ {loading ? "..." : stats.revenue.toLocaleString()}</p>
              <p className="text-green-600 text-xs mt-1 font-semibold flex items-center gap-1">
                Generating value
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Session Completion</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{loading ? "..." : stats.completionRate}%</p>
              <p className="text-blue-600 text-xs mt-1 font-semibold">Reliability Score</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Response Time Card - Mock for now as agreed */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Avg. Response Time</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">~2h</p>
              <p className="text-purple-600 text-xs mt-1 font-semibold">Keep it quick!</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertStats;