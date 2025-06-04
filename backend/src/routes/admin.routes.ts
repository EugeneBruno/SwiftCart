// src/routes/admin.routes.ts
import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/isAdmin';
import prisma from '../config/prisma';

const router = Router();

router.post('/products', authenticate, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, price, imageUrl, category } = req.body;

  try {
    const product = await prisma.product.create({
      data: { name, description, price, imageUrl, category },
    });
    res.status(201).json({ product });
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

router.delete('/products/:id', authenticate, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

export default router;