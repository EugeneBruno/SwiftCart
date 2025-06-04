// src/routes/product.routes.ts
import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';

const router = Router();

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany();
    res.json({ products });
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.json({ product });
  } catch (err) {
    console.error('Fetch product by ID error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

export default router;