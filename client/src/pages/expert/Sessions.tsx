// src/pages/expert/Sessions.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle, Eye, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { Card, PrimaryButton, SecondaryButton } from '../ExpertDashboard';

export default function Sessions() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<any[]>([]);
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    // Hardcoded for testing the restricted flow
    const currentUserId = user?.id || "";

    useEffect(() => {
        // Fetch sessions for this specific expert ID
        axios.get(`/api/sessions/user/${currentUserId}/role/expert`)
            .then(res => res.data)
            .then(data => {
                if (Array.isArray(data)) {
                    setSessions(data);
                } else {
                    setSessions([]);
                }
            })
            .catch(err => {
                console.error("Failed to fetch sessions", err);
                toast.error("Could not load sessions");
            });
    }, [currentUserId]);

    const handleJoin = async (session: any) => {
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

    const handleMarkReview = (sessionId: string) => {
        console.log("Marking review for:", sessionId);
        toast.success("Session marked for review!");
    };

    const handleViewDetails = (session: any) => {
        console.log("Viewing details for:", session);
        toast.info(`Viewing details for session: ${session.sessionId}`);
    };

    const isSessionActive = (session: any) => {
        const now = new Date();
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        // Allow joining 10 mins early
        const bufferStart = new Date(start.getTime() - 10 * 60 * 1000);
        return now >= bufferStart && now < end;
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
        <Card>
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-blue-800">My Sessions</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage your upcoming interviews and reviews</p>
                </div>
                <div className="flex gap-2">
                    <SecondaryButton onClick={() => toast.info("Filter feature coming soon")}>
                        Filter
                    </SecondaryButton>
                    <PrimaryButton onClick={() => toast.info("Syncing calendar...")}>
                        Sync Calendar
                    </PrimaryButton>
                </div>
            </div>

            <div className="space-y-4">
                {sessions.length > 0 ? sessions.map(session => (
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
                                            <div className="hidden sm:flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(session.startTime).getFullYear()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Desktop Actions */}
                                    <div className="hidden md:flex items-center gap-2">
                                        <button
                                            onClick={() => handleMarkReview(session.sessionId)}
                                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors tooltip"
                                            title="Mark as Reviewed"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleViewDetails(session)}
                                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
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
                                    <span className="font-mono text-xs text-gray-500">{session.sessionId.slice(0, 8)}...</span>
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
                                        {new Date() > new Date(session.endTime) ? 'Session Ended' : 'Not started yet'}
                                    </div>
                                )}

                                {/* Mobile Actions (Row) */}
                                <div className="md:hidden grid grid-cols-2 gap-2 mt-1">
                                    <button
                                        onClick={() => handleMarkReview(session.sessionId)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Review
                                    </button>
                                    <button
                                        onClick={() => handleViewDetails(session)}
                                        className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No sessions scheduled</h3>
                        <p className="text-gray-500 mt-1 max-w-sm mx-auto">
                            You don't have any upcoming sessions. Sync your calendar or wait for new bookings.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
