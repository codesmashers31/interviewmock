
import User from "../models/User.js";
import Session from "../models/Session.js";

// @desc    Get dashboard statistics (Total Experts, Users, Sessions)
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        // Count Experts (assuming 'expert' userType)
        const totalExperts = await User.countDocuments({ userType: "expert" });

        // Count Regular Users (assuming 'candidate' userType, or just non-admin/non-expert if preferred)
        // Based on AdminDashboardIndex showing "Total Users", it might mean Candidates.
        // Let's count 'candidate' explicitly.
        const totalUsers = await User.countDocuments({ userType: "candidate" });

        // Count Total Sessions
        const sessionsBooked = await Session.countDocuments({});

        res.status(200).json({
            success: true,
            data: {
                totalExperts,
                totalUsers,
                sessionsBooked
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
