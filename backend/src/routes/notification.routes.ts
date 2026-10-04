import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /notifications — Get all for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { unread, page = '1', limit = '20' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { userId: req.user!.id };
    if (unread === 'true') where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
    ]);

    return res.json({ data: notifications, total, unreadCount, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /notifications/:id/read — Mark as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /notifications/read-all — Mark all as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    return res.json({ message: 'All notifications marked as read' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /notifications/:id — Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await prisma.notification.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Notification deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
