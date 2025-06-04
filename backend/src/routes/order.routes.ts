// src/routes/order.routes.ts
import { Router } from 'express';
import prisma from '../config/prisma';
import { authenticate } from '../middleware/auth.middleware';
import { sendOrderConfirmationEmail } from '../utils/sendEmail';

const router = Router();

// POST /api/orders
router.post('/', authenticate, async (req, res) => {
  const user = (req as any).user;
  const { items } = req.body;

  if (!user?.id || !items || !Array.isArray(items)) {
    res.status(400).json({ message: 'Invalid request.' });
    return;
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    const formattedItems = order.items.map(i => ({
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));

    try {
      await sendOrderConfirmationEmail(
        dbUser.email,
        dbUser.username,
        formattedItems,
        dbUser.address
      );
    } catch (emailErr) {
      console.error('⚠️ Email failed but order succeeded:', emailErr);
    }

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Order creation failed:', err);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

// GET /api/orders
router.get('/', authenticate, async (req, res) => {
  const user = (req as any).user;

  if (!user?.id) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (err) {
    console.error('Fetch orders failed:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;