import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /dashboard/stats — Admin stats
router.get('/stats', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalMembers,
      newMembersThisMonth,
      newMembersLastMonth,
      upcomingEvents,
      upcomingMeetings,
      pendingApplications,
      pendingServiceHours,
      incomeThisYear,
      expenseThisYear,
      activeMembersCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { in: ['admin', 'board_member', 'club_member'] }, isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: thisMonthStart }, isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, isActive: true } }),
      prisma.event.count({ where: { startDate: { gte: now }, isPublished: true } }),
      prisma.meeting.count({ where: { date: { gte: now }, isPublished: true } }),
      prisma.application.count({ where: { status: 'pending' } }),
      prisma.serviceHour.count({ where: { status: 'pending' } }),
      prisma.transaction.aggregate({
        where: { type: 'income', date: { gte: new Date(now.getFullYear(), 0, 1) } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'expense', date: { gte: new Date(now.getFullYear(), 0, 1) } },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    const memberGrowth = newMembersLastMonth === 0
      ? 100
      : Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100);

    const totalIncome = incomeThisYear._sum.amount || 0;
    const totalExpense = expenseThisYear._sum.amount || 0;

    return res.json({
      totalMembers,
      newMembersThisMonth,
      memberGrowth,
      upcomingEvents,
      upcomingMeetings,
      pendingApplications,
      pendingServiceHours,
      financials: {
        income: totalIncome,
        expenses: totalExpense,
        balance: totalIncome - totalExpense,
      },
      activeMembersCount,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /dashboard/charts — Chart data
router.get('/charts', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Monthly transactions for last 6 months
    const transactions = await prisma.transaction.findMany({
      where: { date: { gte: sixMonthsAgo } },
      select: { type: true, amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    // Group by month
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { income: 0, expense: 0 };
    }
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        if (t.type === 'income') monthlyMap[key].income += t.amount;
        else monthlyMap[key].expense += t.amount;
      }
    });

    const monthlyFinancials = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      ...data,
    }));

    // Member roles breakdown
    const roleBreakdown = await prisma.user.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: true,
    });

    // Service hours by month
    const serviceHoursData = await prisma.serviceHour.findMany({
      where: { status: 'approved', date: { gte: sixMonthsAgo } },
      select: { hours: true, date: true },
    });

    const hoursMap: Record<string, number> = {};
    Object.keys(monthlyMap).forEach((k) => (hoursMap[k] = 0));
    serviceHoursData.forEach((h) => {
      const d = new Date(h.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (hoursMap[key] !== undefined) hoursMap[key] += h.hours;
    });

    const monthlyServiceHours = Object.entries(hoursMap).map(([month, hours]) => ({ month, hours }));

    // Event bookings per event (top 5)
    const topEvents = await prisma.event.findMany({
      take: 5,
      include: { _count: { select: { bookings: { where: { status: { in: ['confirmed', 'checked_in'] } } } } } },
      orderBy: { startDate: 'desc' },
    });

    return res.json({
      monthlyFinancials,
      roleBreakdown: roleBreakdown.map((r) => ({ role: r.role, count: r._count })),
      monthlyServiceHours,
      topEvents: topEvents.map((e) => ({ title: e.title, bookings: e._count.bookings })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
