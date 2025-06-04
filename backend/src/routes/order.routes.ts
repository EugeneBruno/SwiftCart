import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { sendOrderConfirmationEmail } from '../utils/sendEmail';

const router = Router();

router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { items } = req.body;
  const userId = req.user?.id;

  if (!userId || !items || !Array.isArray(items)) {
    res.status(400).json({ message: 'Invalid request.' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    const order = await prisma.order.create({
      data: {
        userId,
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

    await sendOrderConfirmationEmail(user.email, user.username, formattedItems, user.address);
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Order placed, but failed to send confirmation email:', err);
    res.status(201).json({ message: 'Order placed, but failed to send confirmation email.' });
  }
});

router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ orders });
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;