import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  MessageSquare,
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
  ExternalLink
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const searchRef = useRef(null);
  const menuRef = useRef(null);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const messageRef = useRef(null);
  const location = useLocation();

  const { user, logout } = useAuth();

  // Fetch user profile image
  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/user/profile', {
            headers: { userid: user.id }
          });
          const data = await response.json();
          if (data.success && data.data.profileImage) {
            setProfileImage(data.data.profileImage);
          }
        } catch (error) {
          console.error('Error fetching profile image:', error);
        }
      }
    };
    fetchProfileImage();
  }, [user?.id]);

  // Close all dropdowns when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
    setIsMessageOpen(false);
  }, [location.pathname]);

  // Scroll lock when dropdowns are open
  useEffect(() => {
    const shouldLockScroll = isMenuOpen || isNotificationOpen || isMessageOpen || isProfileMenuOpen;

    if (shouldLockScroll) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isMenuOpen, isNotificationOpen, isMessageOpen, isProfileMenuOpen]);

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
      if (messageRef.current && !(messageRef.current as any).contains(event.target)) {
        setIsMessageOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Sample notification data
  const notifications = [
    {
      id: 1,
      title: "New HR Connection",
      message: "Sarah from Google viewed your profile",
      time: "5 min ago",
      read: false,
      type: "connection"
    },
    {
      id: 2,
      title: "Mock Interview Scheduled",
      message: "Your mock interview with John is tomorrow at 2 PM",
      time: "1 hour ago",
      read: false,
      type: "interview"
    },
    {
      id: 3,
      title: "Profile Complete",
      message: "Your profile is 85% complete. Add more details!",
      time: "2 hours ago",
      read: true,
      type: "system"
    }
  ];

  // Sample message data
  const messages = [
    {
      id: 1,
      name: "Alex Johnson",
      role: "HR Manager",
      company: "Microsoft",
      message: "Hi! I saw your profile and would like to connect...",
      time: "2 min ago",
      unread: true,
      avatar: "AJ"
    },
    {
      id: 2,
      name: "Maria Garcia",
      role: "Career Coach",
      company: "Meta",
      message: "Your resume feedback is ready for review",
      time: "1 hour ago",
      unread: true,
      avatar: "MG"
    },
    {
      id: 3,
      name: "David Chen",
      role: "Technical Mentor",
      company: "Amazon",
      message: "Great progress on the mock interview!",
      time: "3 hours ago",
      unread: false,
      avatar: "DC"
    }
  ];

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (isSearchOpen && !isMenuOpen) {
      setIsSearchOpen(false);
    }
    setIsNotificationOpen(false);
    setIsMessageOpen(false);
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
    setIsMessageOpen(false);
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
      <nav
        ref={menuRef}
        className={`bg-white border-b border-gray-200/80 sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${scrolled ? "py-2 shadow-lg" : "py-3 shadow-sm"
          }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left side logo + nav items */}
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="flex items-center space-x-3 group"
                onClick={closeAllDropdowns}
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gray-900 rounded-xl group-hover:bg-gray-800 transition-colors duration-300 shadow-lg">
                  <Briefcase className="text-white w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    BenchMock
                  </span>
                  <span className="text-xs text-gray-500 -mt-1">Your Effort Matters!</span>
                </div>
              </Link>

              <div className="hidden lg:flex space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-all duration-200 rounded-lg hover:bg-gray-50/80 group relative"
                    onClick={closeAllDropdowns}
                  >
                    <span className="mr-2 text-gray-600 group-hover:text-gray-900 transition-colors">
                      {item.icon}
                    </span>
                    {item.name}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-3">
              {/* Search */}
              <div ref={searchRef} className={`relative transition-all duration-300 ${isSearchOpen ? "w-72" : "w-12"}`}>
                <button
                  onClick={toggleSearch}
                  className={`absolute right-0 top-1/2 transform -translate-y-1/2 p-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 z-10 ${isSearchOpen ? "bg-gray-50 text-gray-700" : ""
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
                      placeholder="Search mentors, jobs, resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-4 pr-12 py-2.5 text-sm rounded-xl border border-gray-300 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300"
                    />
                  </form>
                </div>
              </div>

              {/* Notifications Dropdown */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsMessageOpen(false);
                    setIsProfileMenuOpen(false);
                  }}
                  className="p-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 relative group"
                >
                  <Bell size={20} />
                  <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold border-2 border-white shadow-sm">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Notifications</h3>
                        <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full font-medium">
                          {notifications.filter(n => !n.read).length} new
                        </span>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-5 py-4 border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-200 cursor-pointer ${!notification.read ? 'bg-blue-50/50' : ''
                            }`}
                          onClick={() => setIsNotificationOpen(false)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-2 h-2 rounded-full mt-2 ${!notification.read ? 'bg-blue-500' : 'bg-gray-300'
                              }`}></div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">
                                {notification.title}
                              </h4>
                              <p className="text-gray-600 text-sm mt-1">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">{notification.time}</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${notification.type === 'connection'
                                  ? 'bg-green-100 text-green-800'
                                  : notification.type === 'interview'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {notification.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                      <Link
                        to="/notifications"
                        className="flex items-center justify-center w-full text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                        onClick={() => setIsNotificationOpen(false)}
                      >
                        View All Notifications
                        <ExternalLink size={14} className="ml-2" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Messages Dropdown */}
              <div className="relative" ref={messageRef}>
                <button
                  onClick={() => {
                    setIsMessageOpen(!isMessageOpen);
                    setIsNotificationOpen(false);
                    setIsProfileMenuOpen(false);
                  }}
                  className="p-2.5 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 relative group"
                >
                  <MessageSquare size={20} />
                  <span className="absolute top-1.5 right-1.5 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold border-2 border-white shadow-sm">
                    {messages.filter(m => m.unread).length}
                  </span>
                </button>

                {isMessageOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-gray-900">Messages</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                          {messages.filter(m => m.unread).length} unread
                        </span>
                      </div>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {messages.map((msg) => (
                        <Link
                          key={msg.id}
                          to={`/messages/${msg.id}`}
                          className={`block px-5 py-4 border-b border-gray-100 hover:bg-gray-50/80 transition-colors duration-200 ${msg.unread ? 'bg-blue-50/50' : ''
                            }`}
                          onClick={() => setIsMessageOpen(false)}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50">
                              <span className="text-sm font-semibold text-gray-700">{msg.avatar}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 text-sm">{msg.name}</h4>
                                {msg.unread && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                )}
                              </div>
                              <p className="text-gray-600 text-sm mt-1 truncate">{msg.message}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-gray-500">{msg.role} • {msg.company}</span>
                                <span className="text-xs text-gray-500">{msg.time}</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>

                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
                      <Link
                        to="/messages"
                        className="flex items-center justify-center w-full text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                        onClick={() => setIsMessageOpen(false)}
                      >
                        View All Messages
                        <ExternalLink size={14} className="ml-2" />
                      </Link>
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
                      setIsMessageOpen(false);
                    }}
                    className="flex items-center space-x-3 focus:outline-none group p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50 shadow-sm overflow-hidden">
                      <img
                        src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || user.email
                        )}&background=374151&color=fff&bold=true`}
                        alt="profile"
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {user.name?.split(" ")[0] || user.email.split("@")[0]}
                      </span>
                      <span className="text-xs text-gray-500">Premium</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={`text-gray-500 transition-transform duration-200 ${isProfileMenuOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 overflow-hidden backdrop-blur-lg">
                      {/* Profile header */}
                      <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50 shadow-sm overflow-hidden">
                            <img
                              src={profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                user.name || user.email
                              )}&background=374151&color=fff&bold=true`}
                              alt="profile"
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate">{user.name || user.email}</h4>
                            <p className="text-sm text-gray-600 truncate">{user.email}</p>
                            <div className="flex items-center mt-1">
                              <div className="px-2 py-0.5 bg-gradient-to-r from-gray-800 to-gray-600 text-white text-xs rounded-full font-medium">
                                PRO Member
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-2">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-5 py-3 hover:bg-gray-50/80 transition-all duration-200 rounded-xl mx-2 text-gray-700 hover:text-gray-900 font-medium text-sm group"
                            onClick={closeAllDropdowns}
                          >
                            <span className="mr-4 text-gray-500 group-hover:text-gray-700 transition-colors">
                              {item.icon}
                            </span>
                            {item.name}
                            <div className="ml-auto w-1 h-1 bg-gray-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </Link>
                        ))}
                      </div>

                      {/* Logout button */}
                      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50/50">
                        <button
                          onClick={() => {
                            logout();
                            closeAllDropdowns();
                          }}
                          className="flex items-center w-full text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl py-3 px-2 font-semibold text-sm transition-all duration-200 group"
                        >
                          <LogOut size={18} className="mr-3 ml-1" />
                          Logout
                          <div className="ml-auto w-1 h-1 bg-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link to="/signin" onClick={closeAllDropdowns}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="font-semibold rounded-xl transition-all duration-300 hover:bg-gray-100 hover:text-gray-900 hover:scale-105 border border-gray-300/50 px-6"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={closeAllDropdowns}>
                    <Button
                      variant="default"
                      size="sm"
                      className="font-semibold text-white rounded-xl bg-gray-900   hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 px-6"
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
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile search bar */}
          {isSearchOpen && (
            <div className="md:hidden mt-3 transition-all duration-300">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Search mentors, jobs, resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 text-sm rounded-xl border border-gray-300 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400 transition-all duration-300"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-gray-500 hover:text-gray-700 rounded-xl transition-colors"
                >
                  <X size={18} />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-2 pt-2 pb-4 space-y-1 sm:px-3 bg-white/95 backdrop-blur-lg border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-4 py-3 rounded-xl text-base font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 transition-all duration-200 group"
                onClick={closeAllDropdowns}
              >
                <span className="mr-3 text-gray-600 group-hover:text-gray-900 transition-colors">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}

            <div className="pt-4 pb-2 border-t border-gray-200">
              <div className="flex space-x-3 px-4 py-3">
                <button
                  className="p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {notifications.filter(n => !n.read).length}
                  </span>
                </button>
                <button
                  className="p-3 text-gray-500 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 relative"
                  onClick={() => setIsMessageOpen(!isMessageOpen)}
                >
                  <MessageSquare size={20} />
                  <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {messages.filter(m => m.unread).length}
                  </span>
                </button>
              </div>

              {user && (
                <div className="px-4 py-3 border-t border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300/50 shadow-sm">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || user.email
                        )}&background=374151&color=fff&bold=true`}
                        alt="profile"
                        className="w-11 h-11 rounded-xl"
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{user.name || user.email}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {profileMenuItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex flex-col items-center justify-center p-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50/80 rounded-xl transition-all duration-200"
                        onClick={closeAllDropdowns}
                      >
                        <span className="mb-2 text-gray-600">{item.icon}</span>
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-3 mt-4">
                {user ? (
                  <Button
                    onClick={() => {
                      logout();
                      closeAllDropdowns();
                    }}
                    variant="ghost"
                    size="sm"
                    className="w-full font-semibold rounded-xl transition-all duration-300 hover:bg-red-50 text-red-600 py-3 border border-red-200"
                  >
                    <LogOut size={18} className="mr-2" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Link to="/signin" className="w-full" onClick={closeAllDropdowns}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full font-semibold rounded-xl transition-all duration-300 hover:bg-gray-50 hover:text-gray-900 py-3 border border-gray-300/50"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup" className="w-full" onClick={closeAllDropdowns}>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full font-semibold rounded-xl bg-gradient-to-r from-gray-900 to-gray-700 hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg py-3"
                      >
                        Join Now
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Overlay for mobile menu and dropdowns */}
      {(isMenuOpen || isNotificationOpen || isMessageOpen || isProfileMenuOpen) && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={closeAllDropdowns}
        />
      )}
    </>
  );
};

export default Navigation;