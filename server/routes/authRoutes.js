import express from "express";
import { sendOtp, verifyOtp, registerUser, loginUser, authenticateToken, getProfile, refresh, logoutUser, verifyGoogleToken } from "../controllers/authController.js";


const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/google-signup', verifyGoogleToken);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/refresh', refresh);
router.post('/logout', logoutUser);
router.get('/profile', authenticateToken, getProfile);


export default router;