import mongoose from "mongoose";

/* ----------------- Review Schema ------------------ */
const reviewSchema = new mongoose.Schema(
    {
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "ExpertDetails",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        isVisible: {
            type: Boolean,
            default: true // Admin can hide inappropriate reviews
        }
    },
    { timestamps: true }
);

// Index for faster queries
reviewSchema.index({ expertId: 1, createdAt: -1 });

export default mongoose.model("Review", reviewSchema);
