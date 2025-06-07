import { Request, Response } from 'express';
import prisma from '../config/prisma';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const createReview = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id;
  const productId = Number(req.params.productId);
  const { rating, comment } = req.body;

  if (!userId || !productId || !rating) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }

  try {
    const existingOrder = await prisma.order.findFirst({
      where: {
        userId,
        items: { some: { productId } }
      }
    });

    if (!existingOrder) {
      res.status(403).json({ message: 'You can only review products you ordered' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment
      }
    });

    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getProductReviews = async (
  req: Request,
  res: Response
): Promise<void> => {
  const productId = Number(req.params.productId);

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { user: { select: { username: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const avgRating = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true }
    });

    res.json({
      averageRating: avgRating._avg.rating || 0,
      reviews
    });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};