import Session from '../models/Session.js';
import User from '../models/User.js';

export const getSessionsForUser = async (userId, role) => {
    // Strict query based on role
    const query = role === 'expert' ? { expertId: userId } : { candidateId: userId };
    // Only return Upcoming or Confirmed sessions (active ones)
    return await Session.find({
        ...query,
        status: { $in: ['upcoming', 'confirmed', 'live'] }
    }).sort({ startTime: 1 });
};

export const createRestrictedTestSession = async (expertEmail, candidateEmail, customStartTime, customEndTime) => {
    // 1. Find Users
    const expert = await User.findOne({ email: expertEmail });
    if (!expert) throw new Error(`Expert not found: ${expertEmail}`);

    const candidate = await User.findOne({ email: candidateEmail });
    if (!candidate) throw new Error(`Candidate not found: ${candidateEmail}`);

    // 2. Determine Start Time
    let nextStart;
    const now = new Date();

    if (customStartTime) {
        // Manual Override
        if (customStartTime === 'NOW') {
            nextStart = new Date(now.getTime() + 2 * 60 * 1000); // Starts in 2 mins
        } else {
            nextStart = new Date(customStartTime);
        }
    } else {
        // Default: Next 10:00 UTC
        nextStart = new Date(now);
        nextStart.setUTCHours(10, 0, 0, 0);
        if (nextStart <= now) {
            nextStart.setDate(nextStart.getDate() + 1);
        }
    }

    // 3. Create Session
    let endTime;
    if (customEndTime) {
        endTime = new Date(customEndTime);
    } else {
        endTime = new Date(nextStart.getTime() + 60 * 60 * 1000); // 1 hour duration
    }

    // Check if exists to avoid duplicates
    const sessionId = `test-restricted-${expert._id}-${candidate._id}`;
    let session = await Session.findOne({ sessionId });

    if (!session) {
        session = new Session({
            sessionId,
            expertId: expert._id.toString(), // Strict DB ID
            candidateId: candidate._id.toString(), // Strict DB ID
            startTime: nextStart,
            endTime: endTime,
            topics: ["Restricted Test", "Strict Auth"],
            status: "confirmed"
        });
        await session.save();
    } else {
        // Update time
        session.startTime = nextStart;
        session.endTime = endTime;
        session.status = "confirmed";
        await session.save();
    }

    return {
        session,
        expertId: expert._id,
        candidateId: candidate._id
    };
};

export const getSessionById = async (sessionId) => {
    return await Session.findOne({ sessionId });
};

export const createSession = async (sessionData) => {
    const session = new Session(sessionData);
    return await session.save();
};

export const getSessionsByExpertId = async (expertId) => {
    return await Session.find({ expertId });
};

export const getSessionsByCandidateId = async (candidateId) => {
    return await Session.find({ candidateId });
};

export const seedTestSession = async () => {
    // 1. Shared Test Session (The "9 to 10" Session)
    // accessible by Candidate (hardcoded fetch) and Expert (via email query)
    const testSessionId = "test-session-001";
    const sharedExpertId = "kohsanar20@gmail.com";

    // Calculate Today 9:00 AM - 10:00 AM
    const now = new Date();
    const start9am = new Date(now);
    start9am.setHours(9, 0, 0, 0);
    const end10am = new Date(now);
    end10am.setHours(10, 0, 0, 0);

    let session = await Session.findOne({ sessionId: testSessionId });

    if (!session) {

        session = new Session({
            sessionId: testSessionId,
            expertId: sharedExpertId, // Unified Expert
            candidateId: "candidate-456",
            startTime: start9am,
            endTime: end10am,
            topics: ["React", "System Design", "Unified Testing"],
            status: "confirmed" // Active/Confirmed
        });
        await session.save();
    } else {
        // Update existing to match current request
        session.expertId = sharedExpertId;
        session.startTime = start9am;
        session.endTime = end10am;
        session.status = "confirmed";
        await session.save();
    }

    // 2. Extra Session (Optional/Previous request persistence)
    // Keeping this but ensuring it doesn't conflict
    const userSessionId = "test-session-kohsanar-extra";
    let userSession = await Session.findOne({ sessionId: userSessionId });

    if (!userSession) {
        userSession = new Session({
            sessionId: userSessionId,
            expertId: sharedExpertId,
            candidateId: "candidate-789",
            startTime: new Date(Date.now() + 1000 * 60 * 60 * 24), // Tomorrow
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 25),
            topics: ["Future Session"],
            status: "Upcoming"
        });
        await userSession.save();
    }

    return [session, userSession];
};

export const getAllSessions = async () => {
    // Import Expert and User models dynamically to avoid circular deps if any
    const Expert = (await import('../models/expertModel.js')).default;
    const User = (await import('../models/User.js')).default;
    const mongoose = (await import('mongoose')).default;

    const sessions = await Session.find().sort({ startTime: -1 }).lean();

    const enrichedSessions = await Promise.all(
        sessions.map(async (session) => {
            let expert = null;
            let candidate = null;

            // 1. Fetch Expert (try userId matching first)
            if (mongoose.Types.ObjectId.isValid(session.expertId)) {
                expert = await Expert.findOne({ userId: session.expertId }).populate('userId');
                // Fallback: maybe expertId IS the expert document ID?
                if (!expert) {
                    expert = await Expert.findById(session.expertId).populate('userId');
                }
            } else {
                // expertId is email or other string
                // Strategy for seeded data: expertId might be email
                const userByEmail = await User.findOne({ email: session.expertId });
                if (userByEmail) {
                    expert = await Expert.findOne({ userId: userByEmail._id }).populate('userId');
                }
            }

            // 2. Fetch Candidate (User)
            if (mongoose.Types.ObjectId.isValid(session.candidateId)) {
                candidate = await User.findById(session.candidateId);
            } else {
                // Strategy for seeded data: candidateId might be string alias or email?
                // Let's assume for now if not ObjectId it might be a user email if strict match
                candidate = await User.findOne({ email: session.candidateId });
            }

            return {
                ...session,
                expertName: expert?.personalInformation?.userName || expert?.userId?.name || session.expertId,
                candidateName: candidate?.name || session.candidateId,
                topic: session.topics?.[0] || "General Consultation",
                status: session.status,
                amount: session.price,
                date: session.startTime,
                duration: session.duration || "N/A"
            };
        })
    );

    return enrichedSessions;
};
