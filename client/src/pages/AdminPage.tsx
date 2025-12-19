import { NavLink, Outlet } from "react-router-dom";
import TopNav from "../components/TopNav";
import React from "react";

export default function AdminPage() {
  const navItems = [
    {
      to: "/admin",
      label: "Dashboard",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M3 13h8V3H3v10zM13 21h8V11h-8v10zM13 3v6h8V3h-8zM3 21h8v-8H3v8z" />
        </svg>
      ),
      end: true,
    },
    {
      to: "/admin/sessions",
      label: "Session Management",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      to: "/admin/experts/pending",
      label: "Expert Verification",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 3" />
        </svg>
      ),
    },
    {
      to: "/admin/experts/verified",
      label: "Verified Experts",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
          <path d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    {
      to: "/admin/experts/rejected",
      label: "Rejected Experts",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      ),
    },
    {
      to: "/admin/users",
      label: "Users",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <circle cx="12" cy="8" r="3" />
          <path d="M6 20c1.5-3 4.5-5 6-5s4.5 2 6 5" />
        </svg>
      ),
    },
    {
      to: "/admin/categories",
      label: "Categories",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
        </svg>
      ),
    },
    {
      to: "/admin/reports",
      label: "Reports",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M4 4h16v4H4zM4 12h16v8H4z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-gray-200 p-5 shadow-sm">
        <h1 className="text-xl font-semibold mb-6 px-2 text-gray-800">
          Admin Panel
        </h1>

        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              <span className="w-5 h-5 text-gray-400">
                {React.cloneElement(item.icon, {
                  className: "w-5 h-5",
                })}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col">
        <TopNav />
        <main className="flex-1 p-8 overflow-x-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
