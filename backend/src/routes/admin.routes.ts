import { Router } from 'express';
import prisma from '../config/prisma';
import { authenticate } from '../middleware/auth.middleware';
import { isAdmin } from '../middleware/isAdmin';

const router = Router();

// Create a product
router.post('/products', authenticate, (req, res, next) => {
  console.log('🧠 req.user from token:', req.user);
  next();
}, isAdmin, async (req, res) => {
  const { name, price, description, imageUrl, category } = req.body;


  if (!name || !price || !description || !category) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        price,
        description,
        imageUrl,
        category
      }
    });

    res.status(201).json({ message: 'Product Added', product });
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete a product
router.delete('/products/:id', authenticate, isAdmin, async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ message: 'Could not delete product' });
  }
});


export default router;
