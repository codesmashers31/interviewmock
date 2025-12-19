// src/components/TopNav.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

export default function TopNav({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { user, logout } = useAuth();



  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications for logged in user
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingNotifications(true);
      const res = await axios.get(`/api/notifications`); // <-- adapt if required
      // expect res.data.notifications: Notification[]
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [user]);

  useEffect(() => {
    // fetch on mount and when user changes
    if (user) fetchNotifications();
    else setNotifications([]);
  }, [user, fetchNotifications]);

  // Click outside & Escape close handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Mark a single notification as read (server + local update)
  const markAsRead = async (id: string) => {
    try {
      // optimistic update
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await axios.post(`/api/notifications/${id}/read`); // adapt to your backend
    } catch (err) {
      console.error("Failed to mark notification read", err);
      // rollback if needed - simple approach: refetch
      fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await axios.post(`/api/notifications/mark-all-read`); // adapt to your backend
    } catch (err) {
      console.error("Failed to mark all read", err);
      fetchNotifications();
    }
  };

  // Sign out handler
  const handleSignOut = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  useEffect(() => {
    if (!user) {
      setAvatarUrl(null);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/expert/profile");




        if (res.data?.success) {
          const url = res.data.profile?.photoUrl || "";



          setAvatarUrl(url || null);
        } else {
          setAvatarUrl(null);
        }
      } catch (err) {
        console.error("Failed to load expert profile", err);
        setAvatarUrl(null);
      }
    };

    fetchProfile();
  }, [user]);


  // Small helper to render icons
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case "warning":
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case "error":
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };

  const avatarSrc = avatarUrl || "./mocki_log.png";

  return (
    <header className="w-full bg-white border-b border-gray-200 p-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none transition-colors duration-200"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:block relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search experts, sessions..."
            className="border border-gray-200 rounded-md pl-10 pr-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            aria-label="Search"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen((s) => !s);
              // If opening, mark that we viewed & optionally fetch latest
              if (!isNotificationsOpen && user) {
                // optionally delay fetch or mark "viewed" on backend
                fetchNotifications();
              }
            }}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none relative transition-colors duration-200"
            aria-haspopup="true"
            aria-expanded={isNotificationsOpen}
            aria-label="Notifications"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>

            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" aria-live="polite">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50" role="dialog" aria-label="Notifications panel">
              <div className="px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800">
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-6 text-center text-gray-500">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h11z" />
                    </svg>
                    <p className="mt-2 text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 hover:bg-gray-50 border-l-4 ${notification.read ? "border-transparent" :
                        notification.type === "success" ? "border-green-500" :
                          notification.type === "warning" ? "border-yellow-500" :
                            notification.type === "error" ? "border-red-500" : "border-blue-500"
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-600 mt-1 truncate">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                        </div>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="flex-shrink-0 text-xs text-blue-600 hover:text-blue-800"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-gray-200">
                <Link to="/notifications" className="w-full block text-center text-sm text-blue-600 hover:text-blue-800 py-2">
                  View all notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen((s) => !s)}
            className="flex items-center gap-2 p-1 rounded-md hover:bg-gray-100 focus:outline-none transition-colors duration-200 group"
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
          >
            <img src={avatarSrc} alt={`${user?.name ?? "User"} avatar`} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
            <div className="hidden sm:block text-sm text-left">
              <div className="font-medium text-gray-900">{user?.name ?? user?.email ?? "Guest"}</div>
              <div className="text-xs text-gray-500">{user?.userType ?? ""}</div>
            </div>
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50" role="menu" aria-label="Profile menu">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm font-medium text-gray-900">{user?.name ?? user?.email}</div>
                <div className="text-sm text-gray-500">{user?.userType}</div>
                <div className="text-xs text-gray-400 mt-1">{user?.email}</div>
                {user?.id && (
                  <div className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                    ID: {user.id}
                  </div>
                )}
              </div>

              {user?.userType === "expert" &&
                <div className="py-1">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    Profile Settings
                  </Link>
                  <Link to="/sessions" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    My Sessions
                  </Link>
                  <Link to="/availability" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    Availability
                  </Link>
                  <Link to="/payments" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                    Payments & Earnings
                  </Link>
                </div>
              }

              <div className="py-1 border-t border-gray-200">
                <button onClick={handleSignOut} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" role="menuitem">
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
