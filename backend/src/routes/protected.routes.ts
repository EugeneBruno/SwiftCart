import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'You accessed a protected route!', user: req.user });
});

export default router;
