// src/routes/auth.routes.ts
import { Router, Request, Response } from 'express';
import { registerUser, verifyOtp, resendOtp, loginUser } from '../controllers/auth.controller';

const router = Router();

router.post('/register', async (req: Request, res: Response) => {
  await registerUser(req, res);
});

router.post('/verify-otp', async (req: Request, res: Response) => {
  await verifyOtp(req, res);
});

router.post('/resend-otp', async (req: Request, res: Response) => {
  await resendOtp(req, res);
});

router.post('/login', async (req: Request, res: Response) => {
  await loginUser(req, res);
});

export default router;