// src/routes/product.routes.ts
import { Router } from 'express';
import prisma from '../config/prisma';

const router = Router();

// GET /api/products
router.get('/', async (_req, res) => {
  try {
    const products = await prisma.product.findMany();
    res.json({ products });
  } catch (error) {
    console.error('Fetch Products Error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (err) {
    console.error('Fetch product by ID error:', err);
    res.status(500).json({ message: 'Something went wrong' });
  }
});


export default router;
