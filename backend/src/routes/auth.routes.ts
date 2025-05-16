// src/routes/auth.routes.ts
import { Router } from 'express';
import { registerUser, verifyOtp, loginUser, resendOtp } from '../controllers/auth.controller';

const router = Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp); 
router.post('/login', loginUser);

export default router;

