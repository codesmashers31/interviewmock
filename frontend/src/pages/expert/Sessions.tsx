// src/pages/expert/Sessions.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

export default function Sessions() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<any[]>([]);

    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    // Hardcoded for testing the restricted flow
    const currentUserId = user?.id || "";

    useEffect(() => {
        // Fetch sessions for this specific expert ID
        fetch(`/api/sessions/user/${currentUserId}/role/expert`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setSessions(data);
                } else {
                    setSessions([]);
                }
            })
            .catch(err => console.error("Failed to fetch sessions", err));
    }, []);

    const handleJoin = async (session: any) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/sessions/${session.sessionId}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });

            const data = await res.json();

            if (res.ok && data.permitted) {
                navigate(`/live-meeting?meetingId=${data.meetingId}&role=expert&userId=${currentUserId}`);
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

    const isSessionActive = (session: any) => {
        const now = new Date();
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        // Allow joining 10 mins early
        const bufferStart = new Date(start.getTime() - 10 * 60 * 1000);
        return now >= bufferStart && now < end;
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-black mb-6">Today's Sessions</h1>
            <div className="space-y-4">
                {sessions.length > 0 ? sessions.map(session => (
                    <div key={session._id || session.sessionId} className="bg-[#1a1a1a] p-4 rounded-lg flex justify-between items-center border border-gray-800">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${session.status === 'confirmed' ? 'bg-green-900 text-green-300' : 'bg-blue-900 text-blue-300'}`}>
                                    {session.status}
                                </span>
                            </div>
                            <h3 className="text-white font-medium">{session.topics?.join(', ') || 'General Interview'}</h3>
                            <p className="text-gray-400 text-sm">
                                {new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}
                            </p>
                            <p className="text-gray-500 text-xs mt-1">ID: {session.sessionId}</p>
                        </div>
                        <button
                            onClick={() => handleJoin(session)}
                            disabled={!isSessionActive(session) || loading}
                            title={!isSessionActive(session) ? `Available at ${new Date(session.startTime).toLocaleTimeString()}` : "Join Now"}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isSessionActive(session)
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                }`}
                        >
                            <Video size={18} />
                            {loading ? 'Verifying...' : 'Join Meeting'}
                        </button>
                    </div>
                )) : (
                    <p className="text-gray-500">No sessions assigned to you ({currentUserId}).</p>
                )}
            </div>
        </div>
    );
}
