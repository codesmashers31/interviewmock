import { SetStateAction, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Video,
  Clock,
  CheckCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
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
import FilterScrollStrip from "./FilterScrollStrip";

const STATUSES = [
  { id: "Upcoming", name: "Upcoming" },
  { id: "Confirmed", name: "Confirmed" },
  { id: "Completed", name: "Completed" }
];


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

const MySessions = ({ hideLayout = false }: { hideLayout?: boolean }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<Session[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sessionsPerPage] = useState<number>(6);
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
            expert: (expert.name && /^[0-9a-fA-F]{24}$/.test(expert.name)) ? "Expert" : (expert.name || "Unknown Expert"),
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
      return matchesSearch && matchesStatus;
    });
    setFilteredSessions(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sessions]);

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
      <div className={`${hideLayout ? '' : 'min-h-screen bg-gray-50 flex flex-col'}`}>
        {!hideLayout && <Navigation />}

        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* --- LEFT SIDEBAR (ADS/TIPS) --- */}
            {!hideLayout && (
              <aside className="hidden xl:col-span-2 lg:col-span-3 lg:block">
                <div className="sticky top-20 space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                    <Star className="w-8 h-8 mb-4 text-amber-400 fill-amber-400" />
                    <h3 className="font-black text-lg mb-2 text-gray-900">Build Your Career</h3>
                    <p className="text-gray-500 text-xs font-medium leading-relaxed mb-4">Get personalized career paths and mentorship from industry experts.</p>
                    <button className="bg-[#004fcb] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all w-full shadow-lg shadow-blue-500/20">Learn More</button>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-green-50 rounded-lg text-green-600">
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Pro Tips</span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex gap-2 text-xs text-gray-600 leading-tight">
                        <span className="text-blue-500 font-bold">•</span>
                        Join 5 mins early to check your internet and camera.
                      </li>
                      <li className="flex gap-2 text-xs text-gray-600 leading-tight">
                        <span className="text-blue-500 font-bold">•</span>
                        Have your CV open for quick reference.
                      </li>
                    </ul>
                  </div>
                </div>
              </aside>
            )}

            {/* --- MAIN CONTENT --- */}
            <main className={`${hideLayout ? 'col-span-12' : 'col-span-12 lg:col-span-6 xl:col-span-7 space-y-6'}`}>

              {/* Header Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">MY SESSIONS</h1>
                    <p className="text-sm text-gray-500 font-medium">Manage and join your upcoming mock interviews</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {sessions.slice(0, 3).map((s, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                          {s.profileImage ? (
                            <img src={getProfileImageUrl(s.profileImage)} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full bg-[#004fcb] flex items-center justify-center text-[10px] text-white font-bold">{s.expert.charAt(0)}</div>
                          )}
                        </div>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-[#004fcb] ml-1">{sessions.length} TOTAL</span>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sessions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-4 focus:ring-[#004fcb]/5 focus:border-[#004fcb]/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Status Tabs */}
              <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
                <FilterScrollStrip
                  items={STATUSES}
                  selectedItem={statusFilter}
                  onSelect={setStatusFilter}
                />
              </div>

              {/* Sessions Grid */}
              {loading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map(i => <SessionCardSkeleton key={i} />)}
                </div>
              ) : currentSessions.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl p-20 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-[#004fcb]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No matching sessions</h3>
                  <p className="text-gray-500 max-w-xs mx-auto">We couldn't find any sessions matching your current filters.</p>
                  <button
                    onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}
                    className="mt-6 text-[#004fcb] font-bold hover:underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {currentSessions.map((session) => (
                    <div
                      key={session.id}
                      className="group bg-white rounded-2xl border border-gray-200 hover:border-[#004fcb]/30 p-5 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#004fcb]/5 relative flex flex-col sm:flex-row gap-6"
                    >
                      {/* Left: Date/Time Badge */}
                      <div className="flex flex-row sm:flex-col items-center justify-center sm:w-24 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100 shrink-0">
                        <span className="text-xs font-black text-[#004fcb] uppercase">{new Date(session.startTime || 0).toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-2xl font-black text-gray-900">{new Date(session.startTime || 0).getDate()}</span>
                        <span className="text-[10px] font-bold text-gray-400 mt-1">{new Date(session.startTime || 0).getFullYear()}</span>
                      </div>

                      {/* Middle: Content */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {isSessionActive(session) ? (
                                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 text-[8px] font-black uppercase lg:animate-pulse">
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                                  Live Now
                                </span>
                              ) : (
                                <span className={`text-[8px] font-black px-2 py-0.5 rounded tracking-tighter uppercase border ${session.status.toLowerCase() === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                                  'bg-blue-50 text-blue-700 border-blue-100'
                                  }`}>
                                  {session.status}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                <Clock className="w-3 h-3" />
                                {session.time} - {new Date(session.endTime || 0).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                <span className="ml-1 text-gray-300">|</span>
                                <span className="ml-1">{session.duration}</span>
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-[#004fcb] transition-colors">
                              {session.expertise?.[0] || session.role}
                            </h3>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                                {session.profileImage ? (
                                  <img src={getProfileImageUrl(session.profileImage)} className="w-full h-full object-cover" alt="" />
                                ) : (
                                  <div className="w-full h-full bg-[#004fcb]/10 text-[#004fcb] text-[8px] font-bold flex items-center justify-center">{session.expert.charAt(0)}</div>
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">With Expert</span>
                                <span className="text-sm font-bold text-gray-700">
                                  {(/^[0-9a-fA-F]{24}$/.test(session.expert)) ? "Platform Expert" : session.expert}
                                  <span className="text-gray-400 font-medium ml-1">@ {session.company}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-lg font-black text-gray-900">{session.price}</span>
                            {isSessionActive(session) && (
                              <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-[#004fcb] uppercase tracking-widest">Meeting ID</span>
                                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">{session.sessionId}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-2">
                          {session.expertise.map((topic, idx) => (
                            <span key={idx} className="bg-gray-50 text-gray-600 text-[10px] font-bold px-2 py-1 rounded-lg border border-gray-100 capitalize">
                              {topic}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                          {session.status.toLowerCase() === 'completed' || isSessionEnded(session) ? (
                            <button
                              onClick={() => setReviewSession(session)}
                              className="flex-1 sm:flex-none px-6 py-2.5 bg-white border border-[#004fcb] text-[#004fcb] rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                            >
                              <Star className="w-3.5 h-3.5" />
                              Rate Now
                            </button>
                          ) : (
                            <button
                              onClick={() => handleJoinMeeting(session)}
                              disabled={!isSessionActive(session)}
                              className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${isSessionActive(session)
                                ? "bg-[#004fcb] text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                            >
                              <Video className="w-3.5 h-3.5" />
                              {isSessionActive(session) ? "Enter Meeting Room" : getSessionStatusInfo(session).reason}
                            </button>
                          )}

                          <div className="relative ml-auto">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === session.sessionId ? null : session.sessionId)}
                              className="p-2.5 rounded-xl border border-gray-200 hover:border-[#004fcb] text-gray-400 hover:text-[#004fcb] transition-all"
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                            {openDropdownId === session.sessionId && (
                              <div className="absolute right-0 bottom-full mb-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden py-1">
                                <button
                                  onClick={() => handleFetchReviews(session, 'expert_feedback')}
                                  className="w-full text-left px-5 py-3 text-[10px] font-black text-gray-700 hover:bg-gray-50 uppercase tracking-widest border-b border-gray-50"
                                >
                                  Expert Feedback
                                </button>
                                <button
                                  onClick={() => handleFetchReviews(session, 'my_review')}
                                  className="w-full text-left px-5 py-3 text-[10px] font-black text-gray-700 hover:bg-gray-50 uppercase tracking-widest"
                                >
                                  My Review
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination (Tighter design) */}
              {filteredSessions.length > sessionsPerPage && (
                <div className="flex items-center justify-center gap-2 pt-6">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${currentPage === 1 ? "bg-gray-50 text-gray-400 border-gray-200" : "bg-white text-gray-900 border-gray-200 hover:border-[#004fcb]"
                      }`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => paginate(i + 1)}
                      className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === i + 1 ? "bg-[#004fcb] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#004fcb]"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${currentPage === totalPages ? "bg-gray-50 text-gray-400 border-gray-200" : "bg-white text-gray-900 border-gray-200 hover:border-[#004fcb]"
                      }`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </main>

            {/* --- RIGHT SIDEBAR (SUMMARY/ADS) --- */}
            {!hideLayout && (
              <aside className="hidden xl:col-span-3 lg:col-span-3 lg:block">
                <div className="sticky top-20 space-y-6">
                  {/* Summary Card */}
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
                    <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-50 rounded-full blur-2xl"></div>
                    <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest mb-6">Session Summary</h3>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#004fcb]">
                            <Video className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{sessions.filter(s => s.status.toLowerCase() === 'confirmed').length}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Upcoming</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900">{sessions.filter(s => s.status.toLowerCase() === 'completed').length}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">Completed</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="bg-gray-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#004fcb] flex items-center justify-center text-white shrink-0">
                          <AlertCircle className="w-5 h-5" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-600 leading-tight">Need help with a session? <span className="text-[#004fcb] cursor-pointer">Contact Support</span></p>
                      </div>
                    </div>
                  </div>

                  {/* Ad Placeholder */}
                  <div className="rounded-3xl overflow-hidden bg-white border border-gray-200 p-6 relative group cursor-pointer shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500">
                    <div className="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative z-10">
                      <span className="bg-amber-100 text-amber-700 text-[8px] font-black px-2 py-0.5 rounded tracking-widest uppercase inline-block mb-3 border border-amber-200">Premium Tool</span>
                      <h4 className="text-gray-900 font-black text-xl mb-2 leading-tight">Mock AI Interviewer</h4>
                      <p className="text-gray-500 text-xs font-medium mb-5 leading-relaxed">Practice with GPT-4 powered interviewers before your real session.</p>
                      <button className="w-full bg-[#004fcb] text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">Try Now</button>
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>


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


        {!hideLayout && <BottomNav />}
        {!hideLayout && <Footer />}
      </div>
    </>
  );
};

export default MySessions;
