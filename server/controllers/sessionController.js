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

        // Import Expert, User and mongoose
        const Expert = (await import('../models/expertModel.js')).default;
        const User = (await import('../models/User.js')).default;
        const mongoose = (await import('mongoose')).default;

        // Enrich sessions with expert details
        const enrichedSessions = await Promise.all(
            sessions.map(async (session) => {
                let expert = null;

                try {
                    // Strategy 1: If expertId is a valid ObjectId, try finding by userId or _id
                    if (mongoose.Types.ObjectId.isValid(session.expertId)) {
                        // A. Try finding by userId (Ref to User)
                        expert = await Expert.findOne({ userId: session.expertId }).populate('userId');

                        // B. Try finding by _id (The Expert Document ID)
                        if (!expert) {
                            expert = await Expert.findById(session.expertId).populate('userId');
                        }
                    }

                    // Strategy 2: If expertId looks like an email (Legacy / Seed Data)
                    if (!expert && typeof session.expertId === 'string' && session.expertId.includes('@')) {
                        const user = await User.findOne({ email: session.expertId });
                        if (user) {
                            expert = await Expert.findOne({ userId: user._id }).populate('userId');
                        }
                    }
                } catch (lookupErr) {
                    console.error(`Expert lookup failed for session ${session.sessionId || 'unknown'}:`, lookupErr);
                }


                // Match Review - Expert's review for this session
                const Review = (await import('../models/reviewModel.js')).default;
                const expertReview = await Review.findOne({ sessionId: session.sessionId, reviewerRole: 'expert' });

                const expertName = expert?.personalInformation?.userName || expert?.userId?.name || 'Unknown Expert';
                const expertRole = expert?.professionalDetails?.title || 'Expert';
                const expertCompany = expert?.professionalDetails?.company || 'N/A';

                return {
                    ...session.toObject(),
                    expertReview: expertReview ? {
                        overallRating: expertReview.overallRating,
                        technicalRating: expertReview.technicalRating,
                        communicationRating: expertReview.communicationRating,
                        strengths: expertReview.strengths,
                        weaknesses: expertReview.weaknesses,
                        feedback: expertReview.feedback
                    } : null,
                    expertDetails: expert ? {
                        name: expertName,
                        role: expertRole,
                        company: expertCompany,
                        category: expert.personalInformation?.category || 'General',
                        profileImage: expert.profileImage || null,
                        rating: expert.metrics?.avgRating || 4.8,
                        reviews: expert.metrics?.totalReviews || 0
                    } : {
                        name: 'Unknown Expert', // If we really can't find the expert doc, but maybe we can find the User?
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

/* -------------------- Submit Review -------------------- */
/* -------------------- Submit Review -------------------- */
export const submitReview = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { overallRating, technicalRating, communicationRating, feedback, strengths, weaknesses, expertId, candidateId, reviewerRole } = req.body;

        // Validation
        if (!sessionId || !overallRating || !reviewerRole) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Dynamically import models and services
        const Review = (await import('../models/reviewModel.js')).default;
        const User = (await import('../models/User.js')).default;
        const sessionService = (await import('../services/sessionService.js'));
        const emailService = (await import('../services/emailService.js'));

        // Check if review already exists for this role
        const existingReview = await Review.findOne({ sessionId, reviewerRole });
        if (existingReview) {
            return res.status(400).json({ success: false, message: "Review already submitted for this session" });
        }

        const newReview = new Review({
            sessionId,
            expertId,      // Passed from frontend
            candidateId,   // Passed from frontend
            reviewerRole,
            overallRating,
            technicalRating: technicalRating || 0,
            communicationRating: communicationRating || 0,
            feedback,
            strengths: strengths || [],
            weaknesses: weaknesses || []
        });

        await newReview.save();

        // Update Session status
        const session = await sessionService.getSessionById(sessionId);
        if (session) {
            if (session.status !== 'completed') {
                session.status = 'completed'; // Ensure it's marked completed
                await session.save();
            }

            // --- SEND EMAIL NOTIFICATION ---
            // Only send notification to candidate if expert reviewed
            if (reviewerRole === 'expert') {
                try {
                    // Fetch Candidate Email
                    let candidateEmail = null;
                    let candidateUserId = null; // We need this for notification

                    if (candidateId.includes('@')) {
                        candidateEmail = candidateId;
                        // If candidateId is email, we can't create in-app notification reliably unless we find User
                        const user = await User.findOne({ email: candidateId });
                        if (user) candidateUserId = user._id;
                    } else {
                        const candidate = await User.findById(candidateId);
                        if (candidate) {
                            candidateEmail = candidate.email;
                            candidateUserId = candidate._id;
                        }
                    }

                    if (candidateEmail) {
                        // Expert name
                        let expertName = "An Expert";
                        // attempt to find expert name if possible or leave generic

                        await emailService.notifyReviewReceived(
                            expertName,
                            candidateEmail,
                            session.topics?.[0] || "Mock Interview",
                            { overallRating, technicalRating, communicationRating, feedback }
                        );
                    } else {
                        console.warn(`Candidate email not found for ID: ${candidateId}. Review email notification skipped.`);
                    }

                    // --- CREATE IN-APP NOTIFICATION ---
                    if (candidateUserId) {
                        const { createNotification } = await import('../controllers/notificationController.js');
                        await createNotification({
                            userId: candidateUserId,
                            type: 'review_received',
                            title: 'New Feedback Received',
                            message: `Your expert has submitted feedback for the session on ${session.topics?.[0] || 'Mock Interview'}. Rating: ${overallRating}/5.`,
                            metadata: {
                                sessionId: sessionId,
                                link: `/my-sessions` // Simplify link for now
                            }
                        });
                    }

                } catch (emailErr) {
                    console.error("Failed to send review email/notification:", emailErr);
                }
            }
        }

        res.status(201).json({ success: true, message: "Review submitted successfully", data: newReview });
    } catch (error) {
        console.error("Submit Review Error:", error);
        res.status(500).json({ success: false, message: error.message || "Server Error" });
    }
};

/* -------------------- Get Session Reviews -------------------- */
export const getSessionReviews = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const Review = (await import('../models/reviewModel.js')).default;

        const reviews = await Review.find({ sessionId });

        const expertReview = reviews.find(r => r.reviewerRole === 'expert') || null;
        const candidateReview = reviews.find(r => r.reviewerRole === 'candidate') || null;

        res.json({
            success: true,
            data: {
                expertReview,
                candidateReview
            }
        });
    } catch (error) {
        console.error("Get Reviews Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
