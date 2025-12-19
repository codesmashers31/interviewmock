import mongoose from "mongoose";

/* ----------------- Education Schema ------------------ */
const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true, trim: true },
  institution: { type: String, required: true, trim: true },
  field: { type: String, trim: true },
  start: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear(),
  },
  end: {
    type: Number,
    required: true,
    min: 1900,
    validate: {
      validator: function (value) {
        return value >= this.start;
      },
      message: "End year must be greater than or equal to start year",
    },
  },
}, { _id: false });

/* ----------------- Experience Schema ------------------ */
const experienceSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  start: { type: Number, required: true },
  end: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.start;
      },
      message: "End year must be greater than or equal to start year",
    },
  },
}, { _id: false });

/* ----------------- Availability Schema ------------------ */
const availabilitySchema = new mongoose.Schema({
  sessionDuration: { type: Number, default: 30 },
  maxPerDay: { type: Number, default: 1, min: 1 },

  weekly: {
    type: Map,
    of: [
      new mongoose.Schema(
        {
          from: { type: String, trim: true },
          to: { type: String, trim: true },
        },
        { _id: false }
      )
    ],
    default: {},
  },

  breakDates: {
    type: [
      {
        start: Date,
        end: Date
      }
    ],
    default: []
  }
});

/* ----------------- Expert Schema ------------------ */

const expertSchema = new mongoose.Schema(
  {
    profileImage: { type: String, trim: true },

    personalInformation: {
      userName: { type: String, required: true, trim: true },
      mobile: { type: String, required: true, trim: true },
      gender: { type: String, enum: ["Male", "Female", "Other"], default: "Male", required: true, trim: true },
      dob: { type: Date, required: true },
      country: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      /* 🔥 CATEGORY - Can only be set once (enforced in controller) */
      category: {
        type: String,
        enum: ["IT", "HR", "Business", "Design", "Marketing", "Finance", "AI"],
        trim: true
        // Note: immutable flag removed - we enforce immutability in controller
      }
    },

    education: {
      type: [educationSchema],
      default: []
    },

    professionalDetails: {
      title: { type: String, trim: true },
      company: { type: String, trim: true },
      totalExperience: { type: Number, min: 0 },
      industry: { type: String, trim: true },
      previous: { type: [experienceSchema], default: [] }
    },

    skillsAndExpertise: {
      mode: {
        type: String,
        enum: ["Online", "Offline", "Hybrid"],
        default: "Online",
        trim: true
      },
      domains: { type: [String], default: [] },
      tools: { type: [String], default: [] },
      languages: { type: [String], default: [] }
    },

    availability: {
      type: availabilitySchema,
      default: () => ({})
    },

    verification: {
      companyId: {
        url: { type: String, trim: true },
        name: { type: String, trim: true }
      },
      aadhar: {
        url: { type: String, trim: true },
        name: { type: String, trim: true }
      },
      linkedin: { type: String, trim: true }
    },

    /* ----------------- Pricing ------------------ */
    pricing: {
      hourlyRate: { type: Number, required: true, default: 500 },
      currency: { type: String, default: "INR", trim: true },
      customPricing: { type: Boolean, default: false } // Admin can override
    },

    /* ----------------- Metrics (Real Data) ------------------ */
    metrics: {
      totalSessions: { type: Number, default: 0 },
      completedSessions: { type: Number, default: 0 },
      cancelledSessions: { type: Number, default: 0 },
      avgRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 } // in hours
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "Active"],
      default: "pending"
    },

    rejectionReason: {
      type: String,
      trim: true
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("ExpertDetails", expertSchema);
