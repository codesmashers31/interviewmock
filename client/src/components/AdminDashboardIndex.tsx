// src/pages/admin/Index.tsx
// src/pages/admin/Index.tsx
import { useEffect, useState } from "react";
import axios from "axios";

// Using hardcoded URL to ensure connectivity
const API_URL = "http://localhost:3000/api";

export default function AdminDashboardIndex() {
  const [stats, setStats] = useState({
    totalExperts: 0,
    totalUsers: 0,
    sessionsBooked: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_URL}/admin/stats`);
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 bg-white shadow rounded-xl text-center">
        <h3 className="text-gray-600">📊 Total Experts</h3>
        <p className="text-3xl font-bold mt-2">
          {loading ? "..." : stats.totalExperts}
        </p>
      </div>
      <div className="p-6 bg-white shadow rounded-xl text-center">
        <h3 className="text-gray-600">👥 Total Users</h3>
        <p className="text-3xl font-bold mt-2">
          {loading ? "..." : stats.totalUsers}
        </p>
      </div>
      <div className="p-6 bg-white shadow rounded-xl text-center">
        <h3 className="text-gray-600">📅 Sessions Booked</h3>
        <p className="text-3xl font-bold mt-2">
          {loading ? "..." : stats.sessionsBooked}
        </p>
      </div>
    </div>
  );
}
