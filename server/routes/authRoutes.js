import express from "express";
import { sendOtp, verifyOtp, registerUser, loginUser, authenticateToken, getProfile } from "../controllers/authController.js";


const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getProfile);


export default router;