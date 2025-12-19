import * as sessionService from '../services/sessionService.js';
import * as meetingService from '../services/meetingService.js';
import { v4 as uuidv4 } from 'uuid'; // Ensure you have uuid or use crypto

export const createSession = async (req, res) => {
    try {
        const { expertId, candidateId, userId, startTime, endTime, topics, price, status } = req.body;

        // Use provided ID or generate one
        const sessionId = req.body.sessionId || `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const sessionData = {
            sessionId,
            expertId,
            candidateId: candidateId || userId, // Handle alias
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            topics: topics || [],
            price: price || 0,
            status: status || 'confirmed'
        };

        const session = await sessionService.createSession(sessionData);
        res.status(201).json({ success: true, message: "Session created successfully", data: session });
    } catch (error) {
        console.error("Create Session Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await sessionService.getSessionById(sessionId);
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSessionsByExpert = async (req, res) => {
    try {
        const { expertId } = req.params;
        const sessions = await sessionService.getSessionsByExpertId(expertId);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSessionsByCandidate = async (req, res) => {
    try {
        const { candidateId } = req.params;
        const sessions = await sessionService.getSessionsByCandidateId(candidateId);

        // Import Expert and mongoose
        const Expert = (await import('../models/expertModel.js')).default;
        const mongoose = (await import('mongoose')).default;

        // Enrich sessions with expert details
        const enrichedSessions = await Promise.all(
            sessions.map(async (session) => {
                let expert = null;

                // Try multiple strategies to find the expert
                // Strategy 1: Direct userId match (if expertId is already the userId)
                expert = await Expert.findOne({ userId: session.expertId });

                // Strategy 2: If expertId looks like an ObjectId, try converting
                if (!expert && mongoose.Types.ObjectId.isValid(session.expertId)) {
                    expert = await Expert.findOne({ userId: new mongoose.Types.ObjectId(session.expertId) });
                }

                // Strategy 3: Try finding by _id in case expertId is the expert document's _id
                if (!expert && mongoose.Types.ObjectId.isValid(session.expertId)) {
                    expert = await Expert.findById(session.expertId);
                }


                if (expert) {

                }

                return {
                    ...session.toObject(),
                    expertDetails: expert ? {
                        name: expert.personalInformation?.userName || 'Unknown Expert',
                        role: expert.professionalDetails?.title || 'Expert',
                        company: expert.professionalDetails?.company || 'N/A',
                        category: expert.personalInformation?.category || 'General',
                        profileImage: expert.profileImage || null,
                        rating: expert.metrics?.avgRating || 4.8,
                        reviews: expert.metrics?.totalReviews || 0
                    } : {
                        name: 'Unknown Expert',
                        role: 'Expert',
                        company: 'N/A',
                        category: 'General',
                        profileImage: null,
                        rating: 0,
                        reviews: 0
                    }
                };
            })
        );

        res.json(enrichedSessions);
    } catch (error) {
        console.error('Get Sessions By Candidate Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Seed restricted test session (Dev only)
export const devSeedSession = async (req, res) => {
    // Check dev flag if needed. For now assuming route protection or local env.
    const { expertEmail, candidateEmail, startTime, endTime } = req.body;

    if (!expertEmail || !candidateEmail) {
        return res.status(400).json({ message: "Expert and Candidate emails required" });
    }

    try {
        const result = await sessionService.createRestrictedTestSession(expertEmail, candidateEmail, startTime, endTime);
        res.status(201).json({
            message: "Restricted test session created",
            ...result
        });
    } catch (error) {
        console.error("Seed Error:", error);
        res.status(404).json({ message: error.message });
    }
};

export const getUserSessions = async (req, res) => {
    try {
        const { userId, role } = req.params;
        // Verify that the requesting user matches the param ID (Security check)
        // In a real app, req.user.id from auth middleware should match userId
        // For this mock, we trust the caller BUT we strictly query by this ID.

        const sessions = await sessionService.getSessionsForUser(userId, role);
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const joinSession = async (req, res) => {
    const { sessionId } = req.params;
    const { userId } = req.body; // In real app, get from req.user

    if (!userId) return res.status(401).json({ message: "User ID required" });

    try {
        const session = await sessionService.getSessionById(sessionId);
        if (!session) return res.status(404).json({ message: "Session not found" });

        // 1. Validate Identity
        if (session.expertId !== userId && session.candidateId !== userId) {
            return res.status(403).json({ message: "Access Denied: You are not a participant of this session." });
        }

        // 2. Validate Time
        const now = new Date();
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);

        // Allow joining 10 mins early
        const bufferStart = new Date(start.getTime() - 10 * 60 * 1000);

        if (now < bufferStart) {
            return res.status(400).json({
                message: "Session has not started yet.",
                startTime: start
            });
        }

        if (now > end) {
            return res.status(400).json({
                message: "Session has ended.",
                endTime: end
            });
        }

        // 3. Success -> Return Meeting Data
        // Ideally we create/fetch the Meeting record here
        await meetingService.getOrCreateMeeting(session.sessionId); // Ensure Meeting doc exists

        // For now, we return valid signal to proceed
        res.json({
            permitted: true,
            meetingId: session.sessionId, // Using sessionId as meetingId
            role: session.expertId === userId ? 'expert' : 'candidate'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Seed endpoint (optional, but good for manual trigger)
export const seedSession = async (req, res) => {
    try {
        const session = await sessionService.seedTestSession();
        res.json(session);
    } catch (error) {
    }
};

/* -------------------- ADMIN: Get All Sessions -------------------- */
export const getAllSessions = async (req, res) => {
    try {
        const sessions = await sessionService.getAllSessions();
        res.json({ success: true, data: sessions });
    } catch (error) {
        console.error("Get All Sessions Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
