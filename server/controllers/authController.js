import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key-change-in-production";

// Send OTP
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999);
    const expires = Date.now() + 5 * 60 * 1000;

    // Save OTP in MongoDB with 5 min expiry
    await Otp.findOneAndUpdate(
      { email },
      { email, otp, expires },
      { upsert: true, new: true }
    );

    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "rashikrashik660@gmail.com",
        pass: "nhgx elec arjb ljwn"
      },
    });

    // Mail options
    const mailOptions = {
      from: '"MockI Support" <mocki@gmail.com>',
      to: email,
      subject: "Your One-Time Password (OTP) - MockI",
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #4CAF50;">MockI Verification</h2>
          <p>Dear User,</p>
          <p>Thank you for using <strong>MockI</strong>. Please use the OTP below to complete your verification:</p>
          
          <p style="font-size: 20px; font-weight: bold; color: #d32f2f; letter-spacing: 2px;">
            ${otp}
          </p>
          
          <p>This OTP will expire in <strong>5 minutes</strong>. Do not share it with anyone for security reasons.</p>
          
          <p style="margin-top: 20px;">Best regards,<br/>The MockI Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const record = await Otp.findOne({ email });

    if (!record) return res.status(400).json({ message: "OTP not found" });
    if (Date.now() > record.expires) return res.status(400).json({ message: "OTP expired" });
    if (parseInt(otp) !== record.otp) return res.status(400).json({ message: "Invalid OTP" });

    // Delete the OTP after successful verification
    await Otp.deleteOne({ email });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Error verifying OTP", error: error.message });
  }
};

// Register User
export const registerUser = async (req, res) => {
  const { email, password, userType, name } = req.body;

  if (!email || !password || !userType || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      userType,
      name
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Protected route example
export const getProfile = async (req, res) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Error getting profile", error: error.message });
  }
};