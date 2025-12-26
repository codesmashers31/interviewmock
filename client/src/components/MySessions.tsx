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
  MoreVertical,
  Loader2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Navigation from "./Navigation";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";


// --- REVIEW DISPLAY MODAL COMPONENT ---
const ReviewDetailsModal = ({
  isOpen,
  onClose,
  type,
  data
}: {
  isOpen: boolean,
  onClose: () => void,
  type: 'expert_feedback' | 'my_review',
  data: any
}) => {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-auto max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
          <h3 className="font-bold text-gray-900 text-lg">
            {type === 'expert_feedback' ? 'Feedback from Expert' : 'My Review of Expert'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-6">

          {/* Ratings Summary */}
          <div className="grid grid-cols-3 gap-2 bg-gray-50 p-4 rounded-xl">
            <div className="text-center p-2">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Overall</p>
              <div className="flex items-center justify-center gap-1 font-bold text-lg text-gray-900">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                {data.overallRating}/5
              </div>
            </div>
            <div className="text-center p-2 border-l border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tech / Skill</p>
              <div className="font-bold text-lg text-gray-900">{data.technicalRating || '-'}/5</div>
            </div>
            <div className="text-center p-2 border-l border-gray-200">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Comm.</p>
              <div className="font-bold text-lg text-gray-900">{data.communicationRating || '-'}/5</div>
            </div>
          </div>

          {/* Strengths */}
          {data.strengths && data.strengths.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" /> Strengths
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.strengths.map((s: string, idx: number) => (
                  <span key={idx} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weaknesses / Improvements */}
          {data.weaknesses && data.weaknesses.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Areas for Improvement
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.weaknesses.map((w: string, idx: number) => (
                  <span key={idx} className="bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm">
                    {w}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          {data.feedback && (
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detailed Feedback</h4>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                {data.feedback}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

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

  sessionId: string;
  expertId: string; // Added for review submission
  expertReview?: {
    overallRating: number;
    technicalRating: number;
    communicationRating: number;
    strengths: string[];
    weaknesses: string[];
    feedback: string;
  } | null;
};

const MySessions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sessionsPerPage] = useState<number>(6);
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { user } = useAuth();

  // Viewing Review State
  const [viewReviewData, setViewReviewData] = useState<{ type: 'expert_feedback' | 'my_review', data: any } | null>(null);

  // Review State
  const [reviewSession, setReviewSession] = useState<Session | null>(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    overallRating: 5,
    technicalRating: 5, // Mapping to 'Expertise'
    communicationRating: 5,
    feedback: "",
    strengths: "",
    weaknesses: ""
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const candidateId = user?.id;
        if (!candidateId) {
          console.warn("No user ID available");
          setSessions([]);
          setFilteredSessions([]);
          return;
        }

        const res = await axios.get(`/api/sessions/candidate/${candidateId}`);
        const data = res.data;

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
            time: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            price: s.price ? `₹${s.price}` : "N/A",
            status: (s.status.charAt(0).toUpperCase() + s.status.slice(1)) as Session["status"],
            meetLink: s.meetLink || "",
            rating: expert.rating || 4.8,
            reviews: expert.reviews || 0,
            duration: `${durationMinutes} minutes`,
            expertise: s.topics || ["General"],
            avatarColor: colors[colorIndex],
            profileImage: expert.profileImage,
            end: s.endTime,
            sessionId: s.sessionId,
            expertId: s.expertId, // Map expertId
            startTime: s.startTime,
            endTime: s.endTime,
            expertReview: s.expertReview // Map expert review for badge
          };
        });

        // Sort by newest first
        const sorted = mappedSessions.sort((a, b) => {
          const timeA = new Date(a.startTime || 0).getTime();
          const timeB = new Date(b.startTime || 0).getTime();
          return timeB - timeA;
        });

        setSessions(sorted);
        setFilteredSessions(sorted);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
        setSessions([]);
        setFilteredSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user?.id]);

  const handleJoinMeeting = async (session: any) => {
    const candidateId = user?.id || "";
    try {
      const res = await axios.post(`/api/sessions/${session.sessionId}/join`, { userId: candidateId });

      const data = res.data;

      if (res.status === 200 && data.permitted) {
        navigate(`/live-meeting?meetingId=${data.meetingId}`, {
          state: {
            role: 'candidate',
            meetingId: data.meetingId
          }
        });
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

    // Allow re-joining for a bit after official end time (e.g., 30 mins buffer)
    const bufferEnd = new Date(end.getTime() + 30 * 60 * 1000);

    if (now > bufferEnd) {
      return { active: false, reason: "Session Ended" };
    }

    return { active: true, reason: "Join Now" };
  };

  const isSessionActive = (session: any) => getSessionStatusInfo(session).active;

  const handleSubmitReview = async () => {
    if (!reviewSession) return;
    setSubmittingReview(true);
    try {
      const payload = {
        overallRating: reviewForm.overallRating,
        technicalRating: reviewForm.technicalRating,
        communicationRating: reviewForm.communicationRating,
        feedback: reviewForm.feedback,
        strengths: reviewForm.strengths.split(',').map(s => s.trim()).filter(Boolean),
        weaknesses: reviewForm.weaknesses.split(',').map(s => s.trim()).filter(Boolean),
        candidateId: user?.id,
        expertId: reviewSession.expertId,
        reviewerRole: 'candidate'
      };

      const res = await axios.post(`/api/sessions/${reviewSession.sessionId}/review`, payload);

      if (res.data.success) {
        toast.success("Review submitted successfully!");
        setReviewSession(null);
        setReviewForm({ // Reset form
          overallRating: 5,
          technicalRating: 5,
          communicationRating: 5,
          feedback: "",
          strengths: "",
          weaknesses: ""
        });
        // Update local state to reflect completion
        setSessions(prev => prev.map(s =>
          s.sessionId === reviewSession.sessionId ? { ...s, status: 'Completed' } : s
        ));
        setFilteredSessions(prev => prev.map(s =>
          s.sessionId === reviewSession.sessionId ? { ...s, status: 'Completed' } : s
        ));
      }
    } catch (error: any) {
      console.error("Review Error:", error);
      toast.error(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleFetchReviews = async (session: Session, type: 'expert_feedback' | 'my_review') => {
    setOpenDropdownId(null);
    try {
      const res = await axios.get(`/api/sessions/${session.sessionId}/reviews`);
      if (res.data.success) {
        const { expertReview, candidateReview } = res.data.data;
        const targetData = type === 'expert_feedback' ? expertReview : candidateReview;

        if (!targetData) {
          toast.info(type === 'expert_feedback' ? "Expert hasn't provided feedback yet." : "You haven't reviewed this session yet.");
          return;
        }

        setViewReviewData({ type, data: targetData });
      }
    } catch (error) {
      console.error("Fetch Review Error:", error);
      toast.error("Failed to fetch reviews");
    }
  };

  const isSessionEnded = (session: Session) => {
    if (!session.endTime) return false;
    // Check if current time is past end time
    return new Date() > new Date(session.endTime);
  };

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

  const SessionCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
      </div>
      <div className="space-y-3 mb-6">
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
      </div>
      <div className="flex justify-between items-center">
        <div className="h-8 w-24 bg-gray-200 rounded"></div>
        <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );

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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <SessionCardSkeleton key={i} />)}
            </div>
          ) : currentSessions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200 border-dashed">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-[#004fcb]" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No sessions found</h3>
              <p className="text-gray-500">Your scheduled interviews will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSessions.map((session) => (
                <div
                  key={session.id}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-[#004fcb] p-6 transition-all duration-300 shadow-sm hover:shadow-md flex flex-col relative"
                >
                  {/* Top Section: Role & Company */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#004fcb] transition-colors line-clamp-1">
                        {session.role}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-medium text-gray-700">{session.company}</span>
                        {session.expert && (
                          <span className="text-xs text-gray-500">• {session.expert}</span>
                        )}
                      </div>
                    </div>
                    {/* Square Profile Image */}
                    {session.profileImage ? (
                      <img
                        src={getProfileImageUrl(session.profileImage)}
                        alt={session.expert}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#004fcb] flex items-center justify-center font-bold text-lg border border-blue-100">
                        {session.expert.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Meta Info: Location, Price, Duration */}
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{session.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{session.date} • {session.time}</span>
                    </div>
                    <div className="font-semibold text-gray-900 mt-2">
                      {session.price}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center gap-3">
                    {/* Primary Button (Like 'Apply Now') */}
                    {isSessionEnded(session) ? (
                      <button
                        onClick={() => setReviewSession(session)}
                        className="flex-1 bg-white border border-[#004fcb] text-[#004fcb] py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Star className="w-4 h-4" />
                        Rate Expert
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoinMeeting(session)}
                        disabled={!isSessionActive(session)}
                        className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 ${isSessionActive(session)
                          ? "bg-[#004fcb] text-white hover:bg-[#003bb5] shadow-sm shadow-blue-200"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" // Disabled look
                          }`}
                      >
                        <Video className="w-4 h-4" />
                        {isSessionActive(session) ? "Join Meeting" : "Join Later"}
                      </button>
                    )}

                    {/* Secondary Action (Menu or Review) */}
                    <div className="relative">
                      <button
                        onClick={() => setOpenDropdownId(openDropdownId === session.sessionId ? null : session.sessionId)}
                        className="p-2.5 rounded-lg border border-gray-200 hover:border-[#004fcb] hover:text-[#004fcb] transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-500" />
                      </button>

                      {openDropdownId === session.sessionId && (
                        <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                          <button
                            onClick={() => handleFetchReviews(session, 'expert_feedback')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-50"
                          >
                            Expert Feedback
                          </button>
                          <button
                            onClick={() => handleFetchReviews(session, 'my_review')}
                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            My Review
                          </button>
                        </div>
                      )}
                      {/* Overlay to close */}
                      {openDropdownId === session.sessionId && (
                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)}></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- READ-ONLY REVIEW MODAL --- */}
          <ReviewDetailsModal
            isOpen={!!viewReviewData}
            onClose={() => setViewReviewData(null)}
            type={viewReviewData?.type || 'expert_feedback'}
            data={viewReviewData?.data}
          />

          {/* --- REVIEW SESSION MODAL --- */}
          {reviewSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 scale-100">
              <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setReviewSession(null)}></div>
              <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-auto max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
                  <h3 className="font-bold text-gray-900 text-lg">Rate Your Expert</h3>
                  <button onClick={() => setReviewSession(null)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg">
                      {reviewSession.expert.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Reviewing Expert</p>
                      <p className="font-bold text-gray-900">{reviewSession.expert}</p>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overall Experience</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewForm(prev => ({ ...prev, overallRating: star }))}
                            className={`transition-transform hover:scale-110 ${star <= reviewForm.overallRating ? 'text-amber-400' : 'text-gray-300'}`}
                          >
                            <Star className="w-8 h-8 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Expertise / Knowledge</label>
                        <input
                          type="number" min="1" max="5"
                          value={reviewForm.technicalRating}
                          onChange={e => setReviewForm(prev => ({ ...prev, technicalRating: parseInt(e.target.value) }))}
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Communication</label>
                        <input
                          type="number" min="1" max="5"
                          value={reviewForm.communicationRating}
                          onChange={e => setReviewForm(prev => ({ ...prev, communicationRating: parseInt(e.target.value) }))}
                          className="w-full border rounded p-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Text Inputs */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">What did you like? (Strengths)</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Very knowledgeable, Patient..."
                      value={reviewForm.strengths}
                      onChange={e => setReviewForm(prev => ({ ...prev, strengths: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement</label>
                    <input
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Could be more structured..."
                      value={reviewForm.weaknesses}
                      onChange={e => setReviewForm(prev => ({ ...prev, weaknesses: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Feedback</label>
                    <textarea
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                      placeholder="Share your experience with this expert..."
                      value={reviewForm.feedback}
                      onChange={e => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                    ></textarea>
                  </div>

                  <button
                    className="w-full justify-center flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmitReview}
                    disabled={submittingReview}
                  >
                    {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </div>
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


        </div>

        <BottomNav />
      </div >
      <Footer />
    </>
  );
};

export default MySessions;