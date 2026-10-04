import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireBoard, requireMember, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /service-hours/leaderboard — Public leaderboard of approved hours
router.get('/leaderboard', async (req: any, res: Response) => {
  try {
    const leaderboard = await prisma.serviceHour.groupBy({
      by: ['userId'],
      where: { status: 'approved' },
      _sum: { hours: true },
      orderBy: { _sum: { hours: 'desc' } },
      take: 20,
    });

    const userIds = leaderboard.map((l) => l.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, avatar: true, role: true },
    });

    const result = leaderboard.map((entry) => ({
      user: users.find((u) => u.id === entry.userId),
      totalHours: entry._sum.hours || 0,
    }));

    return res.json(result);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /service-hours/my — My service hours
router.get('/my', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const hours = await prisma.serviceHour.findMany({
      where: { userId: req.user!.id },
      orderBy: { date: 'desc' },
    });
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
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (status) where.status = status;

    const [entries, total] = await Promise.all([
      prisma.serviceHour.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true, membershipNumber: true } },
        },
      }),
      prisma.serviceHour.count({ where }),
    ]);

    return res.json({ data: entries, total, page: parseInt(page), limit: parseInt(limit) });
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

    const entry = await prisma.serviceHour.create({
      data: {
        userId: req.user!.id,
        activity,
        description: description || null,
        hours: parseFloat(hours),
        date: new Date(date),
        status: 'pending',
      },
    });
    return res.status(201).json(entry);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /service-hours/:id/approve — Admin: approve
router.patch('/:id/approve', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const entry = await prisma.serviceHour.update({
      where: { id: req.params.id },
      data: { status: 'approved', rejectReason: null },
      include: { user: { select: { id: true, firstName: true } } },
    });

    await prisma.notification.create({
      data: {
        userId: entry.userId,
        title: 'Heures de service approuvées',
        message: `Vos ${entry.hours}h pour "${entry.activity}" ont été approuvées.`,
        type: 'success',
      },
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
    const entry = await prisma.serviceHour.update({
      where: { id: req.params.id },
      data: { status: 'rejected', rejectReason: reason || null },
    });

    await prisma.notification.create({
      data: {
        userId: entry.userId,
        title: 'Heures de service refusées',
        message: `Vos heures pour "${entry.activity}" ont été refusées.${reason ? ` Raison : ${reason}` : ''}`,
        type: 'warning',
      },
    });

    return res.json(entry);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
