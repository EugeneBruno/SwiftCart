import { Router, RequestHandler } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createReview, getProductReviews } from '../controllers/review.controller';

const router = Router();

router.post('/:productId', authenticate as RequestHandler, createReview as RequestHandler);
router.get('/:productId', getProductReviews as RequestHandler);

export default router;