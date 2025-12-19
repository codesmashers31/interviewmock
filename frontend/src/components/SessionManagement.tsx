import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Search, RefreshCw, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

interface Session {
  _id: string;
  sessionId: string;
  expertId: string;
  candidateId: string;
  expertName?: string;
  candidateName?: string;
  startTime: string; // ISO Date string
  endTime: string;
  topics: string[];
  price: number;
  status: string; // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  duration?: number;
  meetingLink?: string;
}

export default function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false); // Default desc (newest first)
  const pageSize = 8;

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/sessions/all");
      if (response.data.success) {
        // Transform incoming data to handle MongoDB Extended JSON format
        const formattedSessions = response.data.data.map((session: any) => ({
          ...session,
          _id: session._id?.$oid || session._id,
          startTime: session.startTime?.$date || session.startTime,
          endTime: session.endTime?.$date || session.endTime,
        }));
        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesStatus = filterStatus === "All" || s.status.toLowerCase() === filterStatus.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (s.expertName?.toLowerCase() || "").includes(searchLower) ||
        (s.candidateName?.toLowerCase() || "").includes(searchLower) ||
        s.sessionId.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [sessions, filterStatus, searchTerm]);

  // Sort by date
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [filteredSessions, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedSessions.length / pageSize);
  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper functions for UI
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200'; // "Booked" equivalent
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'upcoming': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate summary stats
  const stats = useMemo(() => ({
    totalSessions: sessions.length,
    totalRevenue: sessions.reduce((sum, s) => sum + (s.price || 0), 0),
    completedSessions: sessions.filter(s => s.status.toLowerCase() === 'completed').length,
    upcomingSessions: sessions.filter(s => ['confirmed', 'upcoming'].includes(s.status.toLowerCase())).length,
  }), [sessions]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">

      {/* Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Session Management</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor all consultation sessions across the platform</p>
        </div>
        <button
          onClick={fetchSessions}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-gray-50/50 border-b border-gray-100">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Revenue</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalRevenue.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Sessions</span>
          <span className="text-2xl font-bold text-gray-900 mt-1">{stats.totalSessions}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-emerald-600 uppercase tracking-wide">Completed</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1">{stats.completedSessions}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Upcoming</span>
          <span className="text-2xl font-bold text-blue-700 mt-1">{stats.upcomingSessions}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search user, expert or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
          >
            <option value="All">All Status</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="w-full overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50/50">
                <tr>
                  <th
                    className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors group select-none"
                    onClick={() => setSortAsc(!sortAsc)}
                  >
                    <div className="flex items-center gap-2">
                      Session Details
                      <ArrowUpDown className={`w-3.5 h-3.5 ${sortAsc ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                    </div>
                  </th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Expert</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSessions.length > 0 ? (
                  paginatedSessions.map((session) => (
                    <tr key={session._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-900 text-sm">
                            {formatDate(session.startTime)}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5">
                            {formatTime(session.startTime)} - {formatTime(session.endTime)}
                          </span>
                          <span className="text-xs text-blue-600 mt-1 inline-block bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 self-start">
                            {session.topics?.[0] || "Consultation"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{session.expertName || "Unknown Expert"}</span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-[120px]" title={session.expertId}>
                            ID: {session.expertId.slice(-6)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">{session.candidateName || "Unknown User"}</span>
                          <span className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-[120px]" title={session.candidateId}>
                            ID: {session.candidateId.slice(-6)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-sm font-bold text-gray-900">
                          ₹{session.price?.toLocaleString() || 0}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                      No sessions found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {filteredSessions.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500 hidden sm:inline-block">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredSessions.length)} of {filteredSessions.length}
          </span>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show sliding window of pages could go here, for now simple first 5
                let pageToShow = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageToShow = currentPage - 2 + i;
                }
                if (pageToShow > totalPages) return null; // Don't render if beyond total

                return (
                  <button
                    key={pageToShow}
                    onClick={() => handlePageChange(pageToShow)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === pageToShow
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {pageToShow}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}