// src/pages/expert/Sessions.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle, Eye, Calendar, Clock, AlertCircle, Search, Filter, ChevronLeft, ChevronRight, X, Star, Timer as TimerIcon, Loader2 } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { Card, PrimaryButton, SecondaryButton } from '../ExpertDashboard';

interface CandidateDetails {
    email: string;
    phone?: string;
    location?: string;
    education: any[];
    experience: any[];
    skills: string[];
    profileImage?: string;
}

interface Session {
    _id: string;
    sessionId: string;
    startTime: string;
    endTime: string;
    status: string;
    topics: string[];
    candidateName: string;
    candidateId: string;
    expertId: string;
    price?: number;
    candidateDetails?: CandidateDetails; // Populated from backend
}

export default function Sessions() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- FILTERS & PAGINATION STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // --- MODAL STATE ---
    const [selectedCandidate, setSelectedCandidate] = useState<Session | null>(null); // For Profile View
    const [reviewSession, setReviewSession] = useState<Session | null>(null); // For Review Form
    const [submittingReview, setSubmittingReview] = useState(false);

    // Review Form State
    const [reviewForm, setReviewForm] = useState({
        overallRating: 5,
        technicalRating: 5,
        communicationRating: 5,
        feedback: "",
        strengths: "",
        weaknesses: ""
    });

    const currentUserId = user?.id || "";

    // Timer Effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!currentUserId) return;
        // Fetch sessions for this specific expert ID
        axios.get(`/api/sessions/user/${currentUserId}/role/expert`)
            .then(res => {
                const data = res.data;
                if (Array.isArray(data)) {
                    // Sort by newest first
                    const sorted = data.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                    setAllSessions(sorted);
                } else {
                    setAllSessions([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch sessions", err);
                toast.error("Could not load sessions");
            });
    }, [currentUserId]);

    // --- FILTER LOGIC ---
    const filteredSessions = allSessions.filter(session => {
        const matchesSearch =
            session.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.topics?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
            session.sessionId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || session.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1); // Reset page on filter change
    }, [searchTerm, statusFilter]);


    // --- HANDLERS ---
    const handleJoin = async (session: Session) => {
        setLoading(true);
        try {
            const res = await axios.post(`/api/sessions/${session.sessionId}/join`, { userId: currentUserId });
            const data = res.data;

            if (res.status === 200 && data.permitted) {
                navigate(`/live-meeting?meetingId=${data.meetingId}`, {
                    state: {
                        role: 'expert',
                        meetingId: data.meetingId
                    }
                });
            } else {
                toast.error(data.message || "Cannot join session at this time.");
            }
        } catch (error) {
            console.error("Join Error:", error);
            toast.error("Failed to join session.");
        } finally {
            setLoading(false);
        }
    };

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
                expertId: currentUserId,
                candidateId: reviewSession.candidateId // Send raw ID, backend knows format
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

                // Optionally update local session status to completed/reviewed
                setAllSessions(prev => prev.map(s =>
                    s.sessionId === reviewSession.sessionId ? { ...s, status: 'completed' } : s
                ));
            }
        } catch (error: any) {
            console.error("Review Error:", error);
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const isSessionActive = (session: Session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const bufferStart = new Date(start.getTime() - 10 * 60 * 1000); // 10 mins early
        return currentTime >= bufferStart && currentTime < end;
    };

    const isSessionEnded = (session: Session) => {
        return currentTime > new Date(session.endTime);
    };

    const getTimerDisplay = (session: Session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);

        if (currentTime < start) {
            const diff = start.getTime() - currentTime.getTime();
            const mins = Math.ceil(diff / 60000);
            if (mins > 60) {
                const hours = Math.ceil(mins / 60);
                return { text: `Starts in ${hours}h`, color: 'text-blue-600 bg-blue-50' };
            }
            return { text: `Starts in ${mins}m`, color: 'text-amber-600 bg-amber-50' };
        }

        if (currentTime >= start && currentTime < end) {
            const diff = end.getTime() - currentTime.getTime();
            const mins = Math.ceil(diff / 60000);
            return { text: `Ends in ${mins}m`, color: 'text-red-600 bg-red-50 animate-pulse' };
        }

        return { text: 'Ended', color: 'text-gray-500 bg-gray-100' };
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (!user) return <div className="p-8 text-center">Please log in to view sessions.</div>;

    return (
        <>
            <Card>
                {/* --- HEADER & CONTROLS --- */}
                <div className="flex flex-col md:flex-row items-start justify-between mb-8 gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-blue-800">My Sessions</h3>
                        <p className="text-sm text-gray-500 mt-1">Manage your upcoming interviews and reviews</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search candidate or topic..."
                                className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none w-full cursor-pointer"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* --- SESSIONS LIST --- */}
                <div className="space-y-4">
                    {currentSessions.length > 0 ? currentSessions.map(session => {
                        const timer = getTimerDisplay(session);
                        // STRICT CHECK: Only allow review if time has explicitly passed end time
                        // We remove '|| session.status === completed' to prevent future sessions that might be marked incorrectly from being reviewed
                        const canReview = isSessionEnded(session);

                        return (
                            <div
                                key={session._id || session.sessionId}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                                <div className="p-5 md:p-6 flex flex-col md:flex-row gap-6">
                                    {/* Date Box */}
                                    <div className="flex-shrink-0 flex md:flex-col items-center justify-center md:w-24 bg-gray-50 rounded-lg border border-gray-100 p-3 gap-2 md:gap-0">
                                        <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                                            {new Date(session.startTime).toLocaleDateString('en-US', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-bold text-gray-900">
                                            {new Date(session.startTime).getDate()}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {new Date(session.startTime).toLocaleDateString('en-US', { weekday: 'short' })}
                                        </span>
                                    </div>

                                    {/* Main Info */}
                                    <div className="flex-grow space-y-3">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
                                                        {session.topics?.join(', ') || 'Mock Interview Session'}
                                                    </h3>
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                                                        {session.status}
                                                    </span>
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500 gap-4 mt-2">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                                        {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-semibold ${timer.color}`}>
                                                        <TimerIcon className="w-3 h-3" />
                                                        {timer.text}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Desktop Actions */}
                                            <div className="hidden md:flex items-center gap-2">
                                                <button
                                                    onClick={() => canReview ? setReviewSession(session) : toast.error("Wait for session to end")}
                                                    disabled={!canReview}
                                                    className={`p-2 rounded-lg transition-colors tooltip ${canReview
                                                            ? 'text-gray-500 hover:text-green-600 hover:bg-green-50 cursor-pointer'
                                                            : 'text-gray-300 cursor-not-allowed bg-gray-50'
                                                        }`}
                                                    title={canReview ? "Mark as Reviewed" : "Wait for session to end"}
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedCandidate(session)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Candidate Profile"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <span className="font-medium text-gray-900">Candidate:</span>
                                            {session.candidateName || "John Doe (Mock)"}
                                            <span className="text-gray-300 mx-1">|</span>
                                            <span className="font-medium text-gray-900">ID:</span>
                                            <span className="font-mono text-xs text-gray-500">{session.candidateId?.slice(0, 8) || "N/A"}</span>
                                        </div>
                                    </div>

                                    {/* Action Button Section */}
                                    <div className="flex flex-col justify-center items-stretch md:w-48 gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6">
                                        <button
                                            onClick={() => handleJoin(session)}
                                            disabled={!isSessionActive(session) || loading}
                                            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm ${isSessionActive(session)
                                                    ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md transform hover:-translate-y-0.5'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            <Video className="w-4 h-4" />
                                            {loading ? 'Joining...' : 'Join Meeting'}
                                        </button>

                                        {!isSessionActive(session) && (
                                            <div className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                {currentTime > new Date(session.endTime) ? 'Session Ended' : 'Not started yet'}
                                            </div>
                                        )}

                                        {/* Mobile Actions (Row) */}
                                        <div className="md:hidden grid grid-cols-2 gap-2 mt-1">
                                            <button
                                                onClick={() => canReview ? setReviewSession(session) : toast.error("Wait for session to end")}
                                                disabled={!canReview}
                                                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${canReview
                                                        ? 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200'
                                                        : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
                                                    }`}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Review
                                            </button>
                                            <button
                                                onClick={() => setSelectedCandidate(session)}
                                                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No sessions found</h3>
                            <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                                Try adjusting your search term or filter to find what you're looking for.
                            </p>
                        </div>
                    )}
                </div>

                {/* --- PAGINATION --- */}
                {filteredSessions.length > itemsPerPage && (
                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-500 hidden sm:block">
                            Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredSessions.length)}</span> of <span className="font-medium">{filteredSessions.length}</span> results
                        </p>

                        <div className="flex items-center gap-2 mx-auto sm:mx-0">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-100 text-gray-300' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* --- CANDIDATE PROFILE MODAL (REAL DATA) --- */}
            {selectedCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCandidate(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.candidateName || "Candidate Profile"}</h3>
                                <p className="text-sm text-gray-500">Applicant Details & Resume</p>
                            </div>
                            <button onClick={() => setSelectedCandidate(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Header Info */}
                            <div className="flex flex-col sm:flex-row gap-6 items-start">
                                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold overflow-hidden">
                                    {/* Use real mock avatar or initials */}
                                    {selectedCandidate.candidateDetails?.profileImage ? (
                                        <img src={selectedCandidate.candidateDetails.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        (selectedCandidate.candidateName || "UK").slice(0, 2).toUpperCase()
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h4 className="font-semibold text-lg text-gray-900">Personal Information</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-gray-500 block">Email</span>
                                            <span className="font-medium text-gray-900">{selectedCandidate.candidateDetails?.email || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Phone</span>
                                            <span className="font-medium text-gray-900">{selectedCandidate.candidateDetails?.phone || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block">Location</span>
                                            <span className="font-medium text-gray-900">{selectedCandidate.candidateDetails?.location || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                    Skills & Expertise
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedCandidate.candidateDetails?.skills && selectedCandidate.candidateDetails.skills.length > 0) ? (
                                        selectedCandidate.candidateDetails.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">No skills listed</span>
                                    )}
                                </div>
                            </div>

                            {/* Experience Section */}
                            <div>
                                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                    Work Experience
                                </h4>
                                <div className="space-y-4">
                                    {(selectedCandidate.candidateDetails?.experience && selectedCandidate.candidateDetails.experience.length > 0) ? (
                                        selectedCandidate.candidateDetails.experience.map((exp, i) => (
                                            <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                <div className="mt-1">
                                                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                </div>
                                                <div>
                                                    <h5 className="font-medium text-gray-900">{exp.position}</h5>
                                                    <p className="text-sm text-gray-600">{exp.company}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No work experience listed</p>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                <SecondaryButton onClick={() => setSelectedCandidate(null)}>Close</SecondaryButton>
                                <PrimaryButton onClick={() => {
                                    toast.success("Resume download not implemented yet");
                                }}>Download Resume</PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- REVIEW SESSION MODAL (REAL FORM) --- */}
            {reviewSession && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 scale-100">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setReviewSession(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-auto max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="font-bold text-gray-900 text-lg">Submit Feedback</h3>
                            <button onClick={() => setReviewSession(null)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg">
                                    {reviewSession.candidateName?.[0] || "C"}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Reviewing Candidate</p>
                                    <p className="font-bold text-gray-900">{reviewSession.candidateName}</p>
                                </div>
                            </div>

                            {/* Ratings */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Overall Performance</label>
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
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">Strengths (comma separated)</label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="Good React knowledge, Clear communication..."
                                    value={reviewForm.strengths}
                                    onChange={e => setReviewForm(prev => ({ ...prev, strengths: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement (comma separated)</label>
                                <input
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    placeholder="System design depth, Error handling..."
                                    value={reviewForm.weaknesses}
                                    onChange={e => setReviewForm(prev => ({ ...prev, weaknesses: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Feedback</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                                    placeholder="Write a detailed summary of the interview..."
                                    value={reviewForm.feedback}
                                    onChange={e => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                                ></textarea>
                            </div>

                            <PrimaryButton
                                className="w-full justify-center flex items-center gap-2"
                                onClick={handleSubmitReview}
                                disabled={submittingReview}
                            >
                                {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                                {submittingReview ? "Submitting..." : "Submit Review"}
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
