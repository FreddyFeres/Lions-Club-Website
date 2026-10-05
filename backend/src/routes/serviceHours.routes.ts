import { Router, Response } from 'express';
import { eq, and, sql, inArray } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { serviceHours, users, notifications } from '../db/schema';
import { authenticate, requireBoard, requireMember, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /service-hours/leaderboard — Public leaderboard of approved hours
router.get('/leaderboard', async (req: any, res: Response) => {
  try {
    const leaderboard = await db.select({
      userId: serviceHours.userId,
      totalHours: sql<number>`COALESCE(SUM(${serviceHours.hours}), 0)`,
    }).from(serviceHours)
      .where(eq(serviceHours.status, 'approved'))
      .groupBy(serviceHours.userId)
      .orderBy(sql`SUM(${serviceHours.hours}) desc`)
      .limit(20);

    const userIds = leaderboard.map((l) => l.userId);
    const userRows = userIds.length
      ? await db.select({
          id: users.id, firstName: users.firstName, lastName: users.lastName,
          avatar: users.avatar, role: users.role,
        }).from(users).where(inArray(users.id, userIds))
      : [];

    const userMap: Record<string, any> = {};
    userRows.forEach((u) => { userMap[u.id] = u; });

    const result = leaderboard.map((entry) => ({
      user: userMap[entry.userId],
      totalHours: Number(entry.totalHours),
    }));

    return res.json(result);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /service-hours/my — My service hours
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const hours = await db.select().from(serviceHours)
      .where(eq(serviceHours.userId, req.user!.id))
      .orderBy(sql`${serviceHours.date} desc`);
    const total = hours.filter((h) => h.status === 'approved').reduce((sum, h) => sum + h.hours, 0);
    return res.json({ entries: hours, totalApproved: total });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /service-hours — Admin: all entries
router.get('/', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (status) conditions.push(eq(serviceHours.status, status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      db.select({
        id: serviceHours.id, activity: serviceHours.activity, description: serviceHours.description,
        hours: serviceHours.hours, date: serviceHours.date, status: serviceHours.status,
        rejectReason: serviceHours.rejectReason, createdAt: serviceHours.createdAt,
        user: {
          id: users.id, firstName: users.firstName, lastName: users.lastName,
          email: users.email, membershipNumber: users.membershipNumber,
        },
      }).from(serviceHours)
        .leftJoin(users, eq(serviceHours.userId, users.id))
        .where(where).orderBy(sql`${serviceHours.createdAt} desc`).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(serviceHours).where(where),
    ]);

    return res.json({ data: rows, total: Number(countResult[0].count), page: pageNum, limit: limitNum });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /service-hours — Log hours
router.post('/', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const { activity, description, hours, date } = req.body;
    if (!activity || !hours || !date) return res.status(400).json({ message: 'Missing required fields' });
    if (hours <= 0 || hours > 24) return res.status(400).json({ message: 'Hours must be between 0 and 24' });

    const [entry] = await db.insert(serviceHours).values({
      id: uuid(), userId: req.user!.id, activity,
      description: description || null,
      hours: parseFloat(hours), date: new Date(date), status: 'pending',
    }).returning();
    return res.status(201).json(entry);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /service-hours/:id/approve — Admin: approve
router.patch('/:id/approve', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const [entry] = await db.update(serviceHours)
      .set({ status: 'approved', rejectReason: null, updatedAt: new Date() })
      .where(eq(serviceHours.id, req.params.id)).returning();

    await db.insert(notifications).values({
      id: uuid(), userId: entry.userId,
      title: 'Heures de service approuvées',
      message: `Vos ${entry.hours}h pour "${entry.activity}" ont été approuvées.`,
      type: 'success',
    });

    return res.json(entry);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /service-hours/:id/reject — Admin: reject
router.patch('/:id/reject', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;
    const [entry] = await db.update(serviceHours)
      .set({ status: 'rejected', rejectReason: reason || null, updatedAt: new Date() })
      .where(eq(serviceHours.id, req.params.id)).returning();

    await db.insert(notifications).values({
      id: uuid(), userId: entry.userId,
      title: 'Heures de service refusées',
      message: `Vos heures pour "${entry.activity}" ont été refusées.${reason ? ` Raison : ${reason}` : ''}`,
      type: 'warning',
    });

    return res.json(entry);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
