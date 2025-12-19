import mongoose from "mongoose";

/* ----------------- Session Schema ------------------ */
const sessionSchema = new mongoose.Schema(
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
        status: {
            type: String,
            enum: ["pending", "confirmed", "completed", "cancelled", "no-show"],
            default: "pending",
            required: true
        },
        scheduledTime: {
            type: Date,
            required: true
        },
        startTime: {
            type: Date
        },
        endTime: {
            type: Date
        },
        duration: {
            type: Number, // in minutes
            default: 30
        },
        price: {
            type: Number,
            required: true
        },
        currency: {
            type: String,
            default: "INR"
        },
        responseTime: {
            type: Number // Time taken by expert to respond (in hours)
        },
        notes: {
            type: String,
            trim: true,
            maxlength: 500
        },
        meetingLink: {
            type: String,
            trim: true
        }
    },
    { timestamps: true }
);

// Indexes for faster queries
sessionSchema.index({ expertId: 1, status: 1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ scheduledTime: 1 });

export default mongoose.model("Session", sessionSchema);
