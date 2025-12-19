import { SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Video,
  User,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Filter,
  X,
  MoreVertical
} from "lucide-react";
import { toast } from "sonner";
import Navigation from "./Navigation";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

type Session = {
  id: number;
  expert: string;
  role: string;
  company: string;
  category: string;
  location: string;
  date: string;
  time: string;
  price: string;
  status: "Upcoming" | "Confirmed" | "Completed" | "upcoming" | "confirmed" | "completed";
  meetLink: string;
  rating: number;
  reviews: number;
  duration: string;
  expertise: string[];
  avatarColor: string;
  profileImage?: string | null;
  startTime?: string;
  endTime?: string;
  sessionId?: string;
};

const MySessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sessionsPerPage] = useState<number>(6);
  const [showFilters, setShowFilters] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const candidateId = user?.id;
        if (!candidateId) {
          console.warn("No user ID available");
          setSessions([]);
          setFilteredSessions([]);
          return;
        }

        const res = await fetch(`/api/sessions/candidate/${candidateId}`);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
          console.error("Invalid response format:", data);
          setSessions([]);
          setFilteredSessions([]);
          return;
        }

        // Map backend sessions to frontend Session type
        const mappedSessions: Session[] = data.map((s: any) => {
          const expert = s.expertDetails || {};
          const startDate = new Date(s.startTime);
          const endDate = new Date(s.endTime);
          const durationMinutes = Math.round((endDate.getTime() - startDate.getTime()) / 60000);

          // Generate avatar color based on expert name
          const colors = [
            "from-blue-500 to-blue-600",
            "from-purple-500 to-purple-600",
            "from-green-500 to-green-600",
            "from-red-500 to-red-600",
            "from-indigo-500 to-indigo-600",
            "from-pink-500 to-pink-600"
          ];
          const colorIndex = (expert.name || "").length % colors.length;

          return {
            id: s._id,
            expert: expert.name || "Unknown Expert",
            role: expert.role || "Expert",
            company: expert.company || "N/A",
            category: expert.category || "General",
            location: "Remote",
            date: startDate.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }),
            time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            price: s.price ? `₹${s.price}` : "N/A",
            status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as Session["status"],
            meetLink: s.meetLink || "",
            rating: expert.rating || 4.8,
            reviews: expert.reviews || 0,
            duration: `${durationMinutes} minutes`,
            expertise: s.topics || ["General"],
            avatarColor: colors[colorIndex],
            profileImage: expert.profileImage,
            sessionId: s.sessionId,
            startTime: s.startTime,
            endTime: s.endTime
          };
        });

        setSessions(mappedSessions);
        setFilteredSessions(mappedSessions);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setSessions([]);
        setFilteredSessions([]);
      }
    };

    fetchSessions();
  }, [user?.id]);

  const handleJoinMeeting = async (session: any) => {
    const candidateId = user?.id || "";
    try {
      const res = await fetch(`/api/sessions/${session.sessionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: candidateId })
      });

      const data = await res.json();

      if (res.ok && data.permitted) {
        navigate(`/live-meeting?meetingId=${data.meetingId}&role=candidate&userId=${candidateId}`);
      } else {
        toast.error(data.message || "Cannot join session at this time.");
      }
    } catch (error) {
      console.error("Join Error:", error);
      toast.error("Failed to join session.");
    }
  };

  const getSessionStatusInfo = (session: any) => {
    const now = new Date();
    let start, end;

    if (session.startTime && session.endTime) {
      start = new Date(session.startTime);
      end = new Date(session.endTime);
    } else if (session.date && session.time) {
      const dateStr = session.date;
      const timeStr = session.time;
      const dateTimeStr = `${dateStr} ${timeStr}`;
      start = new Date(dateTimeStr);
      if (!isNaN(start.getTime())) {
        end = new Date(start.getTime() + 60 * 60 * 1000);
      } else {
        return { active: false, reason: "Invalid Date" };
      }
    } else {
      return { active: false, reason: "No Time Data" };
    }

    const bufferStart = new Date(start.getTime() - 10 * 60 * 1000); // 10 mins before

    if (now < bufferStart) {
      const minutesUntilOpen = Math.ceil((bufferStart.getTime() - now.getTime()) / 60000);
      return {
        active: false,
        reason: `Joinable in ${minutesUntilOpen} min${minutesUntilOpen !== 1 ? 's' : ''}`
      };
    }

    if (now > end) {
      return { active: false, reason: "Session Ended" };
    }

    return { active: true, reason: "Join Now" };
  };

  const isSessionActive = (session: any) => getSessionStatusInfo(session).active;

  // Filter sessions based on search and filters
  useEffect(() => {
    let filtered = sessions.filter(session => {
      const matchesSearch = session.expert.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || session.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || session.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter, sessions]);

  // Pagination
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  const paginate = (pageNumber: SetStateAction<number>) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getStatusColor = (status: Session["status"]) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "Upcoming":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: Session["status"]) => {
    switch (status) {
      case "Confirmed":
        return "✅";
      case "Upcoming":
        return "⏳";
      case "Completed":
        return "🎯";
      default:
        return "📝";
    }
  };

  // Countdown Timer Component
  const CountdownTimer = ({ startTime }: { startTime: string }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
      const updateCountdown = () => {
        const now = new Date().getTime();
        const sessionStart = new Date(startTime).getTime();
        const distance = sessionStart - now;

        if (distance < 0) {
          setTimeLeft("Session Started");
          return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${minutes}m ${seconds}s`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }, [startTime]);

    return (
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg">
        <Clock className="w-4 h-4 text-gray-600" />
        <span>{timeLeft}</span>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">My Sessions</h1>
            <p className="text-gray-600">Manage and track your mentoring sessions</p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search Bar */}
              <div className="flex-1 w-full relative">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 bg-white"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="relative flex-1 lg:flex-none">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 bg-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="IT">IT & Development</option>
                    <option value="HR">HR & Recruitment</option>
                    <option value="Product">Product Management</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Career">Career Coaching</option>
                  </select>
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Filter className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Results Count */}
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                  {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Active Filters */}
            {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">Active filters:</span>

                  {searchTerm && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded border border-blue-200">
                      <span>Search: "{searchTerm}"</span>
                      <button
                        onClick={() => setSearchTerm("")}
                        className="ml-1 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {statusFilter !== 'all' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-sm rounded border border-green-200">
                      <span>Status: {statusFilter}</span>
                      <button
                        onClick={() => setStatusFilter("all")}
                        className="ml-1 hover:text-green-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {categoryFilter !== 'all' && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded border border-purple-200">
                      <span>Category: {categoryFilter}</span>
                      <button
                        onClick={() => setCategoryFilter("all")}
                        className="ml-1 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setCategoryFilter("all");
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800 underline"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sessions Grid */}
          {currentSessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {currentSessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 overflow-hidden group"
                >
                  {/* Header - Gray Theme */}
                  <div className="bg-gradient-to-r from-gray-700 to-gray-800 p-5 text-white">
                    <div className="flex items-center gap-4">
                      {session.profileImage ? (
                        <img
                          src={session.profileImage}
                          alt={session.expert}
                          className="w-14 h-14 rounded-lg object-cover border-2 border-white/30 shadow-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`w-14 h-14 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl border border-white/30 ${session.profileImage ? 'hidden' : ''}`}>
                        {session.expert.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="font-bold text-lg truncate">{session.expert}</h2>
                        <p className="text-white/90 text-sm truncate">{session.role}</p>
                        <p className="text-white/80 text-xs truncate">{session.company}</p>
                      </div>
                    </div>
                  </div>

                  {/* Session Details */}
                  <div className="p-5">
                    {/* Status and Rating */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)} {session.status}
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-700">{session.rating}</span>
                        <span className="text-gray-400 text-xs">({session.reviews})</span>
                      </div>
                    </div>

                    {/* Countdown Timer for Upcoming Sessions */}
                    {(session.status === "Upcoming" || session.status === "Confirmed" || session.status === "confirmed") && session.startTime && (
                      <div className="mb-4">
                        <CountdownTimer startTime={session.startTime} />
                      </div>
                    )}

                    {/* Session Info */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{session.date}</span>
                        <span className="text-gray-300">•</span>
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="truncate">{session.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{session.category}</span>
                        <span className="text-gray-300">•</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>

                    {/* Expertise Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {session.expertise.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {session.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                          +{session.expertise.length - 3}
                        </span>
                      )}
                    </div>
                    {/* Price and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900">{session.price}</div>
                      <div className="flex gap-2">
                        {session.status === "Upcoming" || session.status === "Confirmed" || session.status === "confirmed" ? (
                          <div className="relative group/tooltip">
                            <button
                              onClick={() => handleJoinMeeting(session)}
                              disabled={!isSessionActive(session)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${isSessionActive(session)
                                ? "bg-gray-900 text-white hover:bg-gray-800"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                              <Video className="w-4 h-4" />
                              Join
                            </button>
                            {!isSessionActive(session) && (
                              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                                {getSessionStatusInfo(session).reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <button className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            Review
                          </button>
                        )}
                        <button className="p-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredSessions.length > sessionsPerPage && (
            <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${currentPage === 1
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  }`}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium transition-colors ${currentPage === number
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${currentPage === totalPages
                  ? "border-gray-200 text-gray-400 cursor-not-allowed"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  }`}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Support Card */}
          <div className="bg-gray-900 rounded-xl p-6 text-white mt-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-3">
                  Our support team is here to help you with session-related queries
                </p>
                <button className="bg-gray-800 text-white font-medium py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
      <Footer />
    </>
  );
};

export default MySessions;