import { Router, Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { notifications } from '../db/schema';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /notifications — Get all for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { unread, page = '1', limit = '20' } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(notifications.userId, req.user!.id)];
    if (unread === 'true') conditions.push(eq(notifications.isRead, false));
    const where = and(...conditions);

    const [rows, countResult, unreadResult] = await Promise.all([
      db.select().from(notifications).where(where)
        .orderBy(sql`${notifications.createdAt} desc`).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(notifications).where(where),
      db.select({ count: sql<number>`count(*)` }).from(notifications)
        .where(and(eq(notifications.userId, req.user!.id), eq(notifications.isRead, false))),
    ]);

    return res.json({
      data: rows,
      total: Number(countResult[0].count),
      unreadCount: Number(unreadResult[0].count),
      page: pageNum,
      limit: limitNum,
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /notifications/:id/read — Mark as read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, req.params.id));
    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    const [updated] = await db.update(notifications).set({ isRead: true })
      .where(eq(notifications.id, req.params.id)).returning();
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /notifications/read-all — Mark all as read
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.update(notifications).set({ isRead: true })
      .where(and(eq(notifications.userId, req.user!.id), eq(notifications.isRead, false)));
    return res.json({ message: 'All notifications marked as read' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /notifications/:id — Delete notification
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [notification] = await db.select().from(notifications).where(eq(notifications.id, req.params.id));
    if (!notification || notification.userId !== req.user!.id) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await db.delete(notifications).where(eq(notifications.id, req.params.id));
    return res.json({ message: 'Notification deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
