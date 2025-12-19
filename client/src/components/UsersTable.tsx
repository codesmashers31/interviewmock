import React, { useState, useMemo } from "react";

const initialUsers = [
  { id: 101, name: "Arun Kumar", email: "arun@gmail.com", status: "Active", joined: "2024-10-12", sessions: 12 },
  { id: 102, name: "Sneha R", email: "sneha@yahoo.com", status: "Blocked", joined: "2023-03-21", sessions: 3 },
  { id: 103, name: "Vikram", email: "vikram@gmail.com", status: "Active", joined: "2024-02-14", sessions: 19 },
  { id: 104, name: "Priya Sharma", email: "priya@outlook.com", status: "Active", joined: "2024-11-05", sessions: 7 },
  { id: 105, name: "Rahul Mehta", email: "rahul@gmail.com", status: "Blocked", joined: "2023-12-18", sessions: 0 },
  { id: 106, name: "Kavita Joshi", email: "kavita@mail.com", status: "Active", joined: "2024-08-02", sessions: 4 },
  { id: 107, name: "Manish Patel", email: "manish@mail.com", status: "Active", joined: "2024-01-20", sessions: 9 },
  { id: 108, name: "Neha Singh", email: "neha@mail.com", status: "Blocked", joined: "2023-06-15", sessions: 2 },
];

const UsersTable = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" } : u
      )
    );
  };

  // Filtering by search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  // Sorting helper
  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const arr = [...filtered];
    arr.sort((a, b) => {
      if (sortField === "sessions") {
        return sortOrder === "asc" ? a.sessions - b.sessions : b.sessions - a.sessions;
      }
      if (sortField === "joined") {
        const da = new Date(a.joined).getTime();
        const db = new Date(b.joined).getTime();
        return sortOrder === "asc" ? da - db : db - da;
      }
      return 0;
    });
    return arr;
  }, [filtered, sortField, sortOrder]);

  // Calculate statistics
  const stats = useMemo(() => ({
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "Active").length,
    blockedUsers: users.filter(u => u.status === "Blocked").length,
    totalSessions: users.reduce((sum, u) => sum + u.sessions, 0),
  }), [users]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  React.useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  // Header click handler for sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "desc" ? "asc" : "desc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
    setPage(1);
  };

  // Render sort arrow
  const SortArrow = ({ field }) => {
    if (sortField !== field) {
      return <span className="ml-1 opacity-30">▼</span>;
    }
    return sortOrder === "desc" ? (
      <span className="ml-1 text-blue-600">▼</span>
    ) : (
      <span className="ml-1 text-blue-600">▲</span>
    );
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end - start + 1 < maxVisible) {
        start = end - maxVisible + 1;
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="p-6 bg-linear-to-br from-gray-50 via-white to-blue-50/30 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1 text-sm">Monitor and manage user accounts with advanced controls</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 rounded-2xl p-5 shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
                </div>
                <div className="p-3 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-2xl p-5 shadow-sm border border-green-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Users</p>
                  <p className="text-2xl font-bold text-green-700">{stats.activeUsers}</p>
                </div>
                <div className="p-3 rounded-xl">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-2xl p-5 shadow-sm border border-red-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Blocked Users</p>
                  <p className="text-2xl font-bold text-red-700">{stats.blockedUsers}</p>
                </div>
                <div className="p-3 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-5 shadow-sm border border-purple-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                  <p className="text-2xl font-bold text-purple-700">{stats.totalSessions}</p>
                </div>
                <div className="p-3 rounded-xl">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1">
                  <span className="text-sm font-medium text-gray-700 px-3">Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="bg-white border-0 px-3 py-2 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={5}>5 per page</option>
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
            <h2 className="text-lg font-semibold text-gray-900">User List</h2>
            <p className="text-sm text-gray-600 mt-1">Click on column headers to sort</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-linear-to-r from-gray-50 to-gray-50/50 border-b border-gray-100">
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                  <th
                    onClick={() => handleSort("sessions")}
                    className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors group"
                  >
                    <div className="flex items-center">
                      Sessions
                      <SortArrow field="sessions" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("joined")}
                    className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors group"
                  >
                    <div className="flex items-center">
                      Joined On
                      <SortArrow field="joined" />
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pageData.map((u) => (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
        
                        <div>
                          <p className="font-semibold text-gray-900">{u.name}</p>
                          <p className="text-xs text-gray-500">ID: {u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-700">{u.email}</div>
                    </td>
                    <td className="py-4 px-6">
                      
                          {u.sessions}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-gray-700">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {u.joined}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full font-medium ${
                        u.status === "Active" 
                          ? " text-green-700 " 
                          : " text-red-700 "
                      }`}>
                        
                        {u.status}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleStatus(u.id)}
                          className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                            u.status === "Active" 
                              ? " bg-red-100 text-red-700 hover:from-red-100 hover:to-red-200" 
                              : "bg-green-100 text-green-700 hover:from-green-100 hover:to-green-200"
                          }`}
                        >
                          {u.status === "Active" ? "Block" : "Unblock"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {pageData.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center">
                      <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                        <p className="text-gray-600">Try adjusting your search to find what you're looking for.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-5 border-t border-gray-100 bg-linear-to-r from-gray-50 to-white/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{(page - 1) * pageSize + 1}</span> -{" "}
                <span className="font-medium">{Math.min(page * pageSize, sorted.length)}</span> of{" "}
                <span className="font-medium text-gray-900">{sorted.length}</span> results
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    page === 1 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {pages.map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`min-w-10 h-10 rounded-xl font-medium transition-all ${
                        p === page 
                          ? "bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg" 
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  {totalPages > pages[pages.length - 1] && (
                    <>
                      <span className="px-2 text-gray-400">...</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className="min-w-10 h-10 rounded-xl font-medium text-gray-700 hover:bg-gray-100"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
                    page === totalPages 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                  }`}
                >
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;