import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import axios from '../lib/axios';
import {
  Search,
  Bell,
  Users,
  GraduationCap,
  Calendar,
  X,
  Menu,
  LogOut,
  User,
  Settings,
  BookOpen,
  HelpCircle,
  ChevronDown,
  Briefcase,

} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    link?: string;
  };
}

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const location = useLocation();

  const { user, logout } = useAuth();

  // Fetch user profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.id) {
        try {
          const response = await axios.get('/api/user/profile', {
            headers: { userid: user.id }
          });
          const data = response.data;
          if (data.success && data.data.profileImage) {
            setProfileImage(getProfileImageUrl(data.data.profileImage));
          }
        } catch (error) {
          console.error('Error fetching profile image:', error);
        }
      }
    };
    fetchProfileImage();
  }, [user?.id]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications?unreadOnly=true');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const markAsRead = async (id: string, link?: string) => {
    try {
      await axios.put('/api/notifications/read', { notificationIds: [id] });
      // Optimistic remove
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));

      if (link) {
        // Navigate if link exists
        // window.location.href = link; // or use navigate
      }
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read', { notificationIds: 'all' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };


  // Close all dropdowns when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [location.pathname]);

  // Scroll lock only for mobile menu (if really needed, but removing for now to fix dancing issue)
  useEffect(() => {
    // Original scroll lock logic removed to prevent layout shift ("dancing page")
    // If strict mobile locking is needed, check for screen width or only apply on isMenuOpen for mobile.
    // For now, completely removing it per user feedback.
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !(searchRef.current as any).contains(event.target)) {
        setIsSearchOpen(false);
      }
      if (menuRef.current && !(menuRef.current as any).contains(event.target) && isMenuOpen) {
        setIsMenuOpen(false);
      }
      if (profileMenuRef.current && !(profileMenuRef.current as any).contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notificationRef.current && !(notificationRef.current as any).contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen && !isMenuOpen) {
      setIsSearchOpen(false);
    }
    setIsNotificationOpen(false);
    setIsProfileMenuOpen(false);
  };

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isMenuOpen && !isSearchOpen) {
      setIsMenuOpen(false);
    }
    if (!isSearchOpen) {
      setTimeout(() => {
        const input = document.getElementById("search-input");
        if (input) input.focus();
      }, 100);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
    }
  };

  const closeAllDropdowns = () => {
    setIsNotificationOpen(false);
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  };

  const navItems = [
    { name: "Find HRs", href: "/dashboard", icon: <Users size={18} /> },
    { name: "Find Mentors", href: "/find-mentors", icon: <GraduationCap size={18} /> },
    { name: "My Sessions", href: "/my-sessions", icon: <Calendar size={18} /> },
  ];

  const profileMenuItems = [
    { name: "Profile", href: "/profile", icon: <User size={18} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={18} /> },
    { name: "Resume", href: "/resume", icon: <BookOpen size={18} /> },
    { name: "Help & Support", href: "/help", icon: <HelpCircle size={18} /> },
  ];

  return (
    <>
      {/* Changed padding logic to prevent overflow */}
      <nav
        ref={menuRef}
        className={`bg-white border-b border-blue-100/50 sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 w-full ${scrolled ? "py-2 shadow-lg shadow-blue-900/5" : "py-3 shadow-sm"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Left side logo + nav items */}
            <div className="flex items-center space-x-4 lg:space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-2 group min-w-max"
                onClick={closeAllDropdowns}
              >
                <div className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 bg-blue-50/50 rounded-lg group-hover:bg-blue-100 transition-colors duration-300">
                  <Briefcase className="text-[#004fcb] w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg lg:text-xl font-semibold text-[#002a6b] tracking-tight">
                    BenchMock
                  </span>
                </div>
              </Link>

              <div className="hidden md:flex space-x-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== "/");

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg group relative whitespace-nowrap ${isActive ? "text-[#004fcb] bg-blue-50" : "text-slate-600 hover:text-[#004fcb] hover:bg-blue-50/50"
                        }`}
                      onClick={closeAllDropdowns}
                    >
                      <span className={`mr-2 transition-colors hidden xl:inline ${isActive ? "text-[#004fcb]" : "text-slate-400 group-hover:text-[#004fcb]"
                        }`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
              {/* Search */}
              <div ref={searchRef} className={`relative transition-all duration-300 ${isSearchOpen ? "w-48 lg:w-72" : "w-10 lg:w-12"}`}>
                <button
                  onClick={toggleSearch}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2 lg:p-2.5 text-slate-500 hover:text-[#004fcb] rounded-lg hover:bg-blue-50 transition-all duration-200 z-10 ${isSearchOpen ? "bg-transparent text-slate-700" : ""
                    }`}
                >
                  <Search size={18} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${isSearchOpen ? "opacity-100 w-full" : "opacity-0 w-0"
                    }`}
                >
                  <form onSubmit={handleSearchSubmit} className="relative">
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-10 lg:pr-12 py-2 lg:py-2 text-sm rounded-lg border border-blue-100 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb] transition-all duration-300 font-normal"
                    />
                  </form>
                </div>
              </div>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsProfileMenuOpen(false);
                    if (!isNotificationOpen) fetchNotifications();
                  }}
                  className="p-2 lg:p-2.5 text-slate-500 hover:text-[#004fcb] rounded-lg hover:bg-blue-50 transition-all duration-200 relative"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-[#004fcb] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold border-2 border-white shadow-sm">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-blue-100 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-blue-50 bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Mark all read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <p className="text-sm">No new notifications</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`px-5 py-4 border-b border-slate-50 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer ${!notification.isRead ? 'bg-blue-50/20' : ''
                              }`}
                            onClick={() => {
                              markAsRead(notification._id, notification.metadata?.link);
                            }}
                          >
                            <div className="flex items-start space-x-3">
                              {!notification.isRead && (
                                <div className="w-2 h-2 rounded-full mt-2 bg-[#004fcb]"></div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium text-slate-800 text-sm">
                                  {notification.title}
                                </h4>
                                <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                                  {notification.message}
                                </p>
                                <div className="mt-2 text-[10px] text-slate-400">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        )))}
                    </div>

                    <div className="px-5 py-3 border-t border-blue-50 bg-slate-50/50">
                      <Link to="/notifications" className="block text-center text-xs text-[#004fcb] hover:underline font-medium">View History</Link>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-gray-300/80 mx-1"></div>

              {/* If user logged in show profile, else Sign in / Join Now */}
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      setIsNotificationOpen(false);
                    }}
                    className="flex items-center space-x-2 lg:space-x-3 focus:outline-none group p-1.5 rounded-xl hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center w-8 h-8 lg:w-9 lg:h-9 rounded-lg bg-blue-100 border border-blue-200 shadow-sm overflow-hidden">
                      <img
                        src={profileImage || getProfileImageUrl(null)}
                        alt="profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = getProfileImageUrl(null);
                        }}
                      />
                    </div>
                    <div className="hidden lg:flex flex-col items-start text-left">
                      <span className="text-sm font-medium text-slate-700 group-hover:text-[#004fcb] transition-colors max-w-[100px] truncate">
                        {user.name?.split(" ")[0] || user.email.split("@")[0]}
                      </span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180 text-[#004fcb]" : ""
                        }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-blue-100 rounded-xl shadow-xl py-2 z-50 overflow-hidden">
                      <div className="px-5 py-4 border-b border-blue-50 bg-slate-50/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden">
                            <img
                              src={profileImage || getProfileImageUrl(null)}
                              alt="profile"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = getProfileImageUrl(null);
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-800 text-sm truncate">{user.name || user.email}</h4>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-4 py-2.5 hover:bg-blue-50/50 transition-all duration-200 mx-2 rounded-lg text-slate-600 hover:text-[#004fcb] font-medium text-sm group"
                            onClick={closeAllDropdowns}
                          >
                            <span className="mr-3 text-slate-400 group-hover:text-[#004fcb] transition-colors">
                              {item.icon}
                            </span>
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      <div className="px-2 py-2 border-t border-blue-50 mt-1">
                        <button
                          onClick={() => {
                            logout();
                            closeAllDropdowns();
                          }}
                          className="flex items-center w-full text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg py-2.5 px-4 font-medium text-sm transition-all duration-200"
                        >
                          <LogOut size={16} className="mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/signin" onClick={closeAllDropdowns}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-medium text-slate-600 hover:text-[#004fcb] hover:bg-blue-50 rounded-lg px-4"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={closeAllDropdowns}>
                    <Button
                      variant="default"
                      size="sm"
                      className="font-medium text-white rounded-lg bg-[#004fcb] hover:bg-[#003bb5] px-5 shadow-sm shadow-blue-200"
                    >
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleSearch}
                className="p-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <Search size={20} />
              </button>
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-50 focus:outline-none transition-all duration-200"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {isSearchOpen && (
            <div className="md:hidden mt-3 pb-3 transition-all duration-300">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 text-sm rounded-lg border border-blue-100 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-[#004fcb]/20 focus:border-[#004fcb]"
                  autoFocus
                />
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden bg-white border-t border-blue-100 ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-4 py-4 space-y-2 bg-white">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-[#004fcb] hover:bg-blue-50 transition-all duration-200"
                onClick={closeAllDropdowns}
              >
                <span className="mr-3 text-slate-400 group-hover:text-[#004fcb]">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            <div className="pt-4 border-t border-blue-100 mt-2">
              <Link to="/notifications" className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-600 hover:text-[#004fcb] hover:bg-blue-50">
                <span className="mr-3 text-slate-400"><Bell size={18} /></span>
                Notifications
                {unreadCount > 0 && <span className="ml-auto bg-[#004fcb] text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
              </Link>

              {user ? (
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <div className="flex items-center space-x-3 mb-4 px-2">
                    <img
                      src={getProfileImageUrl(user.profileImage)}
                      alt="profile"
                      className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                      onError={(e) => {
                        e.currentTarget.src = getProfileImageUrl(null);
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{user.name || user.email}</h4>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex flex-col items-center justify-center p-3 text-xs font-medium text-slate-600 hover:text-[#004fcb] hover:bg-blue-50 rounded-lg border border-slate-100"
                        onClick={closeAllDropdowns}
                      >
                        <span className="mb-2 text-slate-400">{item.icon}</span>
                        {item.name}
                      </Link>
                    ))}
                  </div>

                  <button
                    onClick={() => { logout(); closeAllDropdowns(); }}
                    className="w-full mt-4 flex items-center justify-center p-3 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors border border-red-100"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-3 mt-4">
                  <Link to="/signin" className="block" onClick={closeAllDropdowns}>
                    <Button className="w-full bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg py-6 shadow-sm">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" className="block" onClick={closeAllDropdowns}>
                    <Button className="w-full bg-[#004fcb] hover:bg-[#003bb5] text-white rounded-lg py-6 shadow-lg shadow-blue-200">
                      Join Now
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu and dropdowns */}
      {(isMenuOpen || isNotificationOpen || isProfileMenuOpen) && (
        <div
          className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-40 md:hidden"
          onClick={closeAllDropdowns}
        />
      )}
    </>
  );
};

export default Navigation;