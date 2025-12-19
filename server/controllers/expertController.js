// controllers/expertController.js
import path from "path";
import fs from "fs";
import multer from "multer";
import mongoose from "mongoose";
import ExpertDetails from "../models/expertModel.js"; // adjust if file name differs

/* -------------------- Helpers -------------------- */
const resolveUserIdFromReq = (req) => {
  if (req.user) {
    const u = req.user;
    if (u.id) return String(u.id);
    if (u._id) return String(u._id);
    if (u.userId) return String(u.userId);
    if (u.user_id) return String(u.user_id);
    if (u.sub) return String(u.sub);
  }

  // fallback: header (only emergency/legacy)
  const headerCandidate = req.headers.userid || req.headers.userId || req.headers["user-id"];
  if (headerCandidate) {
    // header may contain JSON string or object; try normalize
    try {
      if (typeof headerCandidate === "string" && headerCandidate.trim().startsWith("{")) {
        const parsed = JSON.parse(headerCandidate);
        if (parsed.id) return String(parsed.id);
        if (parsed._id) return String(parsed._id);
        if (parsed.userId) return String(parsed.userId);
      }
      if (typeof headerCandidate === "object") {
        if (headerCandidate.id) return String(headerCandidate.id);
        if (headerCandidate._id) return String(headerCandidate._id);
        if (headerCandidate.userId) return String(headerCandidate.userId);
      }
      return String(headerCandidate);
    } catch (e) {
      return String(headerCandidate);
    }
  }

  return null;
};

const isValidObjectId = (id) => {
  return typeof id === "string" && /^[a-fA-F0-9]{24}$/.test(id);
};

/**
 * Convert to mongoose ObjectId only if id is a valid 24-hex string.
 * Otherwise return the original id (so searches against string-stored ids still work).
 */
const toObjectId = (id) => {
  if (!isValidObjectId(id)) return id;
  return new mongoose.Types.ObjectId(id);
};

/* -------------------- getMissingSectionsHelper -------------------- */
const getMissingSections = (expert) => {
  const missing = [];

  // Personal Info
  const p = expert.personalInformation || {};
  const personalFilled = p.userName && p.mobile && p.gender && p.dob && p.country && p.state && p.city;
  if (!personalFilled) missing.push("Personal Information");

  // Education
  if (!Array.isArray(expert.education) || !expert.education.length) missing.push("Education");

  // Professional Details
  const pd = expert.professionalDetails || {};
  const proFilled = pd.title && pd.company && pd.industry && (typeof pd.totalExperience === "number");
  if (!proFilled) missing.push("Professional Details");

  // Skills
  const sk = expert.skillsAndExpertise || {};
  if (!(sk.domains?.length || sk.tools?.length || sk.languages?.length)) missing.push("Skills & Expertise");

  // Availability
  const av = expert.availability || {};
  const weeklyObj = av.weekly || {};
  const weeklyHasSlots = Object.values(weeklyObj || {}).some(arr => Array.isArray(arr) && arr.length > 0);
  const availabilityFilled = av.sessionDuration && av.maxPerDay && (weeklyHasSlots || (av.breakDates && av.breakDates.length > 0));
  if (!availabilityFilled) missing.push("Availability");

  // Profile Photo
  if (!expert.profileImage) missing.push("Profile Photo");

  // Verification
  const v = expert.verification || {};
  const verificationFilled = v.companyId?.url && v.aadhar?.url && v.linkedin;
  if (!verificationFilled) missing.push("Verification Documents");

  return missing;
};

/* -------------------- computeCompletion -------------------- */
const computeCompletion = (expert) => {
  let score = 0;

  // Personal Info (20%)
  const p = expert.personalInformation || {};
  const personalFilled = p.userName && p.mobile && p.gender && p.dob && p.country && p.state && p.city;
  if (personalFilled) score += 20;

  // Education (15%)
  if (Array.isArray(expert.education) && expert.education.length) score += 15;

  // Professional Details (20%)
  const pd = expert.professionalDetails || {};
  const proFilled = pd.title && pd.company && pd.industry && (typeof pd.totalExperience === "number");
  if (proFilled) score += 20;

  // Skills (15%)
  const sk = expert.skillsAndExpertise || {};
  if ((sk.domains?.length || sk.tools?.length || sk.languages?.length)) score += 15;

  // Availability (15%)
  const av = expert.availability || {};
  // ensure weekly is treated as plain object
  const weeklyObj = av.weekly || {};
  const weeklyHasSlots = Object.values(weeklyObj || {}).some(arr => Array.isArray(arr) && arr.length > 0);
  const availabilityFilled = av.sessionDuration && av.maxPerDay && (weeklyHasSlots || (av.breakDates && av.breakDates.length > 0));
  if (availabilityFilled) score += 15;

  // Profile Photo (5%)
  if (expert.profileImage) score += 5;

  // Verification (10%)
  const v = expert.verification || {};
  if (v.companyId?.url && v.aadhar?.url && v.linkedin) score += 10;

  return Math.min(score, 100);
};

/* -------------------- multer for uploads -------------------- */
const uploadDir = path.join(process.cwd(), "uploads", "profileImages");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || ".jpg";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});
export const uploadMiddleware = multer({ storage });

const verificationUploadDir = path.join(process.cwd(), "uploads", "verification");
if (!fs.existsSync(verificationUploadDir)) fs.mkdirSync(verificationUploadDir, { recursive: true });

const verificationStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, verificationUploadDir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || ".pdf";
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}-verification${ext}`;
    cb(null, name);
  },
});
export const uploadVerificationMiddleware = multer({ storage: verificationStorage });

/* -------------------- uploadProfilePhoto -------------------- */
export const uploadProfilePhoto = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded. Use field 'photo'." });

    // build accessible URL (use host from request)
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;
    const photoUrl = `${protocol}://${host}/uploads/profileImages/${req.file.filename}`;


    // find expert
    const queryUserId = toObjectId(userIdRaw);

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert profile not found. Create personal info first." });
    }

    expert.profileImage = photoUrl;
    await expert.save();

    const completion = computeCompletion(expert);
    const missingSections = getMissingSections(expert);

    const profile = {
      name: expert.personalInformation?.userName || "",
      title: expert.professionalDetails?.title || "",
      company: expert.professionalDetails?.company || "",
      photoUrl: expert.profileImage || ""
    };

    return res.json({ success: true, message: "Photo uploaded", completion, missingSections, profile });
  } catch (err) {
    console.error("uploadProfilePhoto error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

export const getExpertProfileImage = async (req, res) => {
  try {
    const userIdRaw = req.user?.id || req.user?._id;
    if (!userIdRaw) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const expert = await ExpertDetails.findOne({ userId: userIdRaw }).lean();

    const image = expert?.profileImage || "";

    return res.json({ success: true, image });
  } catch (err) {
    console.error("getExpertProfileImage error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


/* -------------------- uploadVerificationDocs -------------------- */
export const uploadVerificationDocs = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (!expert) {
      return res.status(404).json({ success: false, message: 'Expert profile not found.' });
    }

    // Initialize verification object if missing
    if (!expert.verification) expert.verification = {};

    // build accessible URL (use host from request)
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${process.env.PORT || 3000}`;

    // Handle uploaded files
    if (req.files) {
      if (req.files.companyIdFile && req.files.companyIdFile[0]) {
        expert.verification.companyId = {
          url: `${protocol}://${host}/uploads/verification/${req.files.companyIdFile[0].filename}`,
          name: req.files.companyIdFile[0].originalname
        };
      }
      if (req.files.aadharFile && req.files.aadharFile[0]) {
        expert.verification.aadhar = {
          url: `${protocol}://${host}/uploads/verification/${req.files.aadharFile[0].filename}`,
          name: req.files.aadharFile[0].originalname
        };
      }
    }

    // Handle linkedin URL
    if (req.body.linkedin) {
      expert.verification.linkedin = req.body.linkedin;
    }

    await expert.save();

    return res.json({
      success: true,
      message: 'Verification details updated',
      verification: expert.verification
    });

  } catch (err) {
    console.error("uploadVerificationDocs error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

/* -------------------- resubmitProfile -------------------- */
export const resubmitProfile = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    // Only allow resubmission if currently rejected
    if (expert.status !== "rejected") {
      return res.status(400).json({ success: false, message: "Only rejected profiles can be resubmitted." });
    }

    expert.status = "pending";
    expert.rejectionReason = ""; // Clear reason on resubmit
    await expert.save();

    return res.json({ success: true, message: "Profile resubmitted for verification", status: "pending" });
  } catch (err) {
    console.error("resubmitProfile error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getExpertProfile -------------------- */
export const getExpertProfile = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId }).lean();
    if (!expert) return res.status(404).json({ success: false, message: "Expert profile not found" });

    const profile = {
      name: expert.personalInformation?.userName || "",
      mobile: expert.personalInformation?.mobile || "",
      gender: expert.personalInformation?.gender || "",
      dob: expert.personalInformation?.dob ? new Date(expert.personalInformation.dob).toISOString().split("T")[0] : "",
      country: expert.personalInformation?.country || "",
      state: expert.personalInformation?.state || "",
      city: expert.personalInformation?.city || "",
      title: expert.professionalDetails?.title || "",
      company: expert.professionalDetails?.company || "",
      totalExperience: expert.professionalDetails?.totalExperience ?? "",
      industry: expert.professionalDetails?.industry || "",
      previous: expert.professionalDetails?.previous || [],
      education: expert.education || [],
      skillsAndExpertise: expert.skillsAndExpertise || { mode: "Online", domains: [], tools: [], languages: [] },
      availability: expert.availability || { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] },
      verification: expert.verification || {},
      status: expert.status || "pending",
      rejectionReason: expert.rejectionReason || "",
      photoUrl: expert.profileImage || "",
      category: expert.personalInformation?.category || ""
    };

    const completion = computeCompletion(expert);
    const missingSections = getMissingSections(expert);
    return res.json({ success: true, completion, missingSections, profile });
  } catch (err) {
    console.error("getExpertProfile error:", err);
    return res.status(500).json({ success: false, message: err.message || "Internal server error" });
  }
};

/* -------------------- getExpertById (Admin/Public View) -------------------- */
export const getExpertById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    // Usually we look up by Expert _id, not userId, when we have the specific ID
    let expert = await ExpertDetails.findById(id).lean();

    // If not found, try finding by userId just in case
    if (!expert) {
      expert = await ExpertDetails.findOne({ userId: id }).lean();
    }

    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    // Populate user details if needed (optional)
    // const user = await User.findById(expert.userId).lean();

    const profile = {
      _id: expert._id,
      userId: expert.userId,
      name: expert.personalInformation?.userName || "",
      mobile: expert.personalInformation?.mobile || "",
      gender: expert.personalInformation?.gender || "",
      dob: expert.personalInformation?.dob ? new Date(expert.personalInformation.dob).toISOString().split("T")[0] : "",
      country: expert.personalInformation?.country || "",
      state: expert.personalInformation?.state || "",
      city: expert.personalInformation?.city || "",
      title: expert.professionalDetails?.title || "",
      company: expert.professionalDetails?.company || "",
      totalExperience: expert.professionalDetails?.totalExperience ?? "",
      industry: expert.professionalDetails?.industry || "",
      previous: expert.professionalDetails?.previous || [],
      education: expert.education || [],
      skillsAndExpertise: expert.skillsAndExpertise || { mode: "Online", domains: [], tools: [], languages: [] },
      availability: expert.availability || { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] },
      verification: expert.verification || {},
      status: expert.status || "pending",
      photoUrl: expert.profileImage || "",
      category: expert.personalInformation?.category || ""
    };

    return res.json({ success: true, profile });
  } catch (err) {
    console.error("getExpertById error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* -------------------- getPersonalInfo (uses resolver) -------------------- */
export const getPersonalInfo = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (expert) {
      return res.status(200).json({ success: true, data: expert.personalInformation });
    } else {
      return res.status(200).json({
        success: true,
        data: { userName: "", mobile: "", gender: "", dob: "", country: "", state: "", city: "" }
      });
    }
  } catch (err) {
    console.error("getPersonalInfo error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updatePersonalInfo = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const { userName = "", mobile = "", gender = "Male", dob = null, country = "", state = "", city = "", category = "" } = req.body;



    // First, check if expert exists and if category is being changed
    const existingExpert = await ExpertDetails.findOne({ userId: queryUserId });

    if (existingExpert) {

    }

    if (existingExpert && existingExpert.personalInformation?.category && category && existingExpert.personalInformation.category !== category) {
      // Category already set and trying to change it
      // Category already set and trying to change it
      return res.status(400).json({
        success: false,
        message: "Category has already been set and cannot be changed"
      });
    }

    // Build update object using $set for nested fields
    const updateObj = {
      "personalInformation.userName": (userName || "").toString().trim(),
      "personalInformation.mobile": (mobile || "").toString().trim(),
      "personalInformation.gender": gender,
      "personalInformation.dob": dob,
      "personalInformation.country": (country || "").toString().trim(),
      "personalInformation.state": (state || "").toString().trim(),
      "personalInformation.city": (city || "").toString().trim(),
      userId: queryUserId
    };

    // Only add category if it's provided and valid
    if (category) {
      const allowedCategories = ["IT", "HR", "Business", "Design", "Marketing", "Finance", "AI"];
      if (allowedCategories.includes(category)) {
        updateObj["personalInformation.category"] = category;

      } else {

      }
    } else {

    }



    const expert = await ExpertDetails.findOneAndUpdate(
      { userId: queryUserId },
      { $set: updateObj },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );



    return res.status(200).json({ success: true, message: "Personal info updated successfully", data: expert });
  } catch (error) {
    console.error("❌ updatePersonalInfo error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getEducation / updateEducation / deleteEducationEntry -------------------- */
export const getEducation = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (expert && expert.education && expert.education.length) return res.status(200).json({ success: true, data: expert.education });
    return res.status(200).json({ success: true, data: [] });
  } catch (err) {
    console.error("getEducation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateEducation = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { education } = req.body;
    if (!education || !Array.isArray(education)) return res.status(400).json({ success: false, message: "Education must be an array" });

    const mapped = education.map(edu => ({
      degree: edu.degree || "",
      institution: edu.institution || "",
      field: edu.field || "",
      start: edu.start || null,
      end: edu.end || null
    }));

    const expert = await ExpertDetails.findOneAndUpdate(
      { userId: queryUserId },
      { education: mapped, userId: queryUserId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Education updated", data: expert.education });
  } catch (err) {
    console.error("updateEducation error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteEducationEntry = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { idx } = req.params;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    if (!Array.isArray(expert.education) || idx < 0 || idx >= expert.education.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }

    expert.education.splice(idx, 1);
    await expert.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Education entry deleted", data: expert.education });
  } catch (err) {
    console.error("deleteEducationEntry error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getProfessional / updateProfessional / deletePreviousExperience -------------------- */
export const getProfessional = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (expert && expert.professionalDetails) return res.status(200).json({ success: true, data: expert.professionalDetails });

    return res.status(200).json({ success: true, data: { title: "", company: "", totalExperience: "", industry: "", previous: [] } });
  } catch (err) {
    console.error("getProfessional error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateProfessional = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const professionalDetails = req.body.professionalDetails || req.body;
    if (!professionalDetails) return res.status(400).json({ success: false, message: "Professional details required" });

    const payload = {
      title: professionalDetails.title || "",
      company: professionalDetails.company || "",
      totalExperience: Number(professionalDetails.totalExperience) || 0,
      industry: professionalDetails.industry || "",
      previous: Array.isArray(professionalDetails.previous)
        ? professionalDetails.previous.map(exp => ({
          company: exp.company || "",
          title: exp.title || "",
          start: exp.start || null,
          end: exp.end || null
        }))
        : []
    };

    const expert = await ExpertDetails.findOneAndUpdate(
      { userId: queryUserId },
      { professionalDetails: payload, userId: queryUserId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, message: "Professional details updated", data: expert.professionalDetails });
  } catch (err) {
    console.error("updateProfessional error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deletePreviousExperience = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { idx } = req.params;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    if (!expert.professionalDetails || !Array.isArray(expert.professionalDetails.previous) || idx < 0 || idx >= expert.professionalDetails.previous.length) {
      return res.status(400).json({ success: false, message: "Invalid index" });
    }

    expert.professionalDetails.previous.splice(idx, 1);
    await expert.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Previous experience deleted", data: expert.professionalDetails.previous });
  } catch (err) {
    console.error("deletePreviousExperience error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getSkillsAndExpertise / updateSkillsAndExpertise -------------------- */
export const getSkillsAndExpertise = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "Skills & Expertise fetched successfully",
      data: expert.skillsAndExpertise || { mode: "Online", domains: [], tools: [], languages: [] }
    });
  } catch (err) {
    console.error("getSkillsAndExpertise error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateSkillsAndExpertise = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);

    const skills = req.body.skillsAndExpertise;

    if (!skills) return res.status(400).json({ success: false, message: "skillsAndExpertise is required in body" });

    const { mode, domains, tools, languages } = skills;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "User not found" });

    if (!expert.skillsAndExpertise) expert.skillsAndExpertise = { mode: "Online", domains: [], tools: [], languages: [] };

    if (mode) {
      const allowedModes = ["Online", "Offline", "Hybrid"];
      if (!allowedModes.includes(mode)) return res.status(400).json({ success: false, message: "Invalid mode" });
      expert.skillsAndExpertise.mode = mode;
    }
    if (Array.isArray(domains)) expert.skillsAndExpertise.domains = domains;
    if (Array.isArray(tools)) expert.skillsAndExpertise.tools = tools;
    if (Array.isArray(languages)) expert.skillsAndExpertise.languages = languages;

    await expert.save({ validateBeforeSave: false });

    return res.status(200).json({ success: true, message: "Skills updated", data: expert.skillsAndExpertise });
  } catch (err) {
    console.error("updateSkillsAndExpertise error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getAvailability / updateAvailability / delete helpers -------------------- */
export const getAvailability = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const expert = await ExpertDetails.findOne({ userId: queryUserId });

    if (expert && expert.availability) return res.status(200).json({ success: true, data: expert.availability });

    return res.status(200).json({ success: true, data: { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] } });
  } catch (err) {
    console.error("getAvailability error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateAvailability = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });

    const queryUserId = toObjectId(userIdRaw);
    const newAvailability = req.body;

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    if (!expert.availability) expert.availability = { sessionDuration: 30, maxPerDay: 1, weekly: {}, breakDates: [] };

    expert.availability.sessionDuration = newAvailability.sessionDuration ?? expert.availability.sessionDuration;
    expert.availability.maxPerDay = newAvailability.maxPerDay ?? expert.availability.maxPerDay;
    // ensure weekly is a plain object
    expert.availability.weekly = newAvailability.weekly ?? expert.availability.weekly ?? {};
    expert.availability.breakDates = newAvailability.breakDates ?? expert.availability.breakDates ?? [];

    await expert.save();
    return res.status(200).json({ success: true, message: "Availability updated", data: expert.availability });
  } catch (err) {
    console.error("updateAvailability error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteBreakDate = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { start } = req.body;
    if (!start) return res.status(400).json({ success: false, message: "Break start missing" });

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    // Normalize and compare ISO strings to be robust for Date/string variants
    const targetIso = new Date(start).toISOString();
    expert.availability = expert.availability || { breakDates: [], weekly: {} };
    expert.availability.breakDates = (expert.availability.breakDates || []).filter(d => {
      try {
        return new Date(d.start).toISOString() !== targetIso;
      } catch (e) {
        // if parsing fails, keep the entry
        return true;
      }
    });

    await expert.save();
    return res.status(200).json({ success: true, message: "Break date removed", data: expert.availability.breakDates });
  } catch (err) {
    console.error("deleteBreakDate error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteWeeklySlot = async (req, res) => {
  try {
    const userIdRaw = resolveUserIdFromReq(req);
    if (!userIdRaw) return res.status(401).json({ success: false, message: "Unauthorized: user id missing" });
    const queryUserId = toObjectId(userIdRaw);
    const { day, from } = req.body;
    if (!day || !from) return res.status(400).json({ success: false, message: "Day or from missing" });

    const expert = await ExpertDetails.findOne({ userId: queryUserId });
    if (!expert) return res.status(404).json({ success: false, message: "Expert not found" });

    expert.availability = expert.availability || { weekly: {} };
    const weekly = expert.availability.weekly || {};
    const slots = Array.isArray(weekly[day]) ? weekly[day] : [];
    weekly[day] = slots.filter(slot => slot.from !== from);
    expert.availability.weekly = weekly;

    await expert.save();
    return res.status(200).json({ success: true, message: "Slot removed", data: expert.availability.weekly[day] });
  } catch (err) {
    console.error("deleteWeeklySlot error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/* -------------------- getPendingExperts (Pending verification) -------------------- */
export const getPendingExperts = async (req, res) => {
  try {
    const experts = await ExpertDetails.aggregate([
      { $match: { status: "pending" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: false
        }
      }
    ]);

    return res.json({ success: true, data: experts });
  } catch (err) {
    console.error("getPendingExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/* -------------------- getVerifiedExperts (Active experts only) -------------------- */
/* -------------------- getRejectedExperts (Rejected experts only) -------------------- */
export const getRejectedExperts = async (req, res) => {
  try {
    const experts = await ExpertDetails.aggregate([
      { $match: { status: "rejected" } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: false
        }
      }
    ]);

    return res.json({ success: true, data: experts });
  } catch (err) {
    console.error("getRejectedExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};
/* -------------------- getVerifiedExperts (Active experts only) -------------------- */
export const getVerifiedExperts = async (req, res) => {
  try {
    const { category } = req.query;

    const pipeline = [
      { $match: { status: "Active" } }
    ];

    if (category && category !== "all") {
      pipeline[0].$match["personalInformation.category"] = category;
    }

    pipeline.push(
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      {
        $unwind: {
          path: "$userDetails",
          preserveNullAndEmptyArrays: false // Only show experts with valid user account
        }
      }
    );

    const experts = await ExpertDetails.aggregate(pipeline);

    // Format matches frontend expectation + joined data
    const formatted = experts.map(expert => ({
      _id: expert._id,
      userId: expert.userId,
      profileImage: expert.profileImage || "",
      personalInformation: {
        userName: expert.personalInformation?.userName || "",
        mobile: expert.personalInformation?.mobile || "",
        gender: expert.personalInformation?.gender || "",
        dob: expert.personalInformation?.dob || null,
        country: expert.personalInformation?.country || "",
        state: expert.personalInformation?.state || "",
        city: expert.personalInformation?.city || "",
        category: expert.personalInformation?.category || "IT"
      },
      professionalDetails: {
        title: expert.professionalDetails?.title || "",
        company: expert.professionalDetails?.company || "",
        totalExperience: expert.professionalDetails?.totalExperience || 0,
        industry: expert.professionalDetails?.industry || "",
        previous: expert.professionalDetails?.previous || []
      },
      skillsAndExpertise: {
        mode: expert.skillsAndExpertise?.mode || "Online",
        domains: expert.skillsAndExpertise?.domains || [],
        tools: expert.skillsAndExpertise?.tools || [],
        languages: expert.skillsAndExpertise?.languages || []
      },
      availability: {
        sessionDuration: expert.availability?.sessionDuration || 30,
        maxPerDay: expert.availability?.maxPerDay || 1,
        weekly: expert.availability?.weekly || {},
        breakDates: expert.availability?.breakDates || []
      },
      verification: expert.verification || {},
      userDetails: {
        email: expert.userDetails?.email || "",
        _id: expert.userDetails?._id
      }
    }));

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("getVerifiedExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/* -------------------- getAllExperts (Public Listing) -------------------- */
export const getAllExperts = async (req, res) => {
  try {
    const experts = await ExpertDetails.find().lean();

    const formatted = experts.map(expert => ({
      id: expert._id,
      name: expert.personalInformation?.userName || "",
      role: expert.professionalDetails?.title || "",
      experience: (expert.professionalDetails?.totalExperience || 0) + " yrs",
      skills: expert.skillsAndExpertise?.languages || [],
      rating: 4.8,
      price: "₹499",
      category: expert.category, // ⭐ IMPORTANT
      company: expert.professionalDetails?.company || "",
      avatar: expert.profileImage || "",
      location: expert.personalInformation?.city || "",
      reviews: 32,
      responseTime: "1 hour",
      successRate: 92,
      isVerified: true
    }));

    return res.json({ success: true, data: formatted });

  } catch (err) {
    console.error("getAllExperts error:", err);
    return res.status(500).json({ success: false, message: "Internal error" });
  }
};

/* -------------------- Approve Expert -------------------- */
export const approveExpert = async (req, res) => {
  try {
    const { id } = req.params;
    const expert = await ExpertDetails.findByIdAndUpdate(
      id,
      { status: "Active" },
      { new: true }
    );

    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    return res.json({ success: true, message: "Expert approved successfully", data: expert });
  } catch (err) {
    console.error("approveExpert error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/* -------------------- Reject Expert -------------------- */
export const rejectExpert = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: "Rejection reason is required" });
    }

    const expert = await ExpertDetails.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectionReason: reason
      },
      { new: true }
    );

    if (!expert) {
      return res.status(404).json({ success: false, message: "Expert not found" });
    }

    return res.json({ success: true, message: "Expert rejected successfully", data: expert });
  } catch (err) {
    console.error("rejectExpert error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

