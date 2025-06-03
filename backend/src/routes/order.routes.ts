import { Router, Request, Response } from 'express';
import prisma from '../config/prisma';
import { authenticate } from '../middleware/auth.middleware';
import { sendOrderConfirmationEmail } from '../utils/sendEmail';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response) => {
  const { items, ref } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ message: 'Invalid items array' });
  }

  try {
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
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // ✅ Fetch user info
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user?.email) {
      try {
        await sendOrderConfirmationEmail(
          user.email,
          user.firstName,
          user.address,
          order.items.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
          }))
        );
        console.log('✅ Order confirmation email sent to', user.email);
      } catch (emailErr) {
        console.error('❌ Failed to send order confirmation email:', emailErr);
      }
    }

    return res.status(201).json({ message: 'Order placed successfully', order });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({ message: 'Failed to place order' });
  }
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ orders });
  } catch (err) {
    console.error('Order fetch error:', err);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export default router;