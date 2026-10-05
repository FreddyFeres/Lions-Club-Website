import { Router, Response } from 'express';
import { eq, gte, and, inArray, sql } from 'drizzle-orm';
import db from '../db';
import { users, events, meetings, applications, serviceHours, transactions, eventBookings } from '../db/schema';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /dashboard/stats — Admin stats
router.get('/stats', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const [
      totalMembersResult,
      newMembersThisMonthResult,
      newMembersLastMonthResult,
      upcomingEventsResult,
      upcomingMeetingsResult,
      pendingApplicationsResult,
      pendingServiceHoursResult,
      incomeResult,
      expenseResult,
      activeMembersResult,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users)
        .where(and(inArray(users.role, ['admin', 'board_member', 'club_member']), eq(users.isActive, true))),
      db.select({ count: sql<number>`count(*)` }).from(users)
        .where(and(gte(users.createdAt, thisMonthStart), eq(users.isActive, true))),
      db.select({ count: sql<number>`count(*)` }).from(users)
        .where(and(gte(users.createdAt, lastMonthStart), sql`${users.createdAt} <= ${lastMonthEnd}`, eq(users.isActive, true))),
      db.select({ count: sql<number>`count(*)` }).from(events)
        .where(and(gte(events.startDate, now), eq(events.isPublished, true))),
      db.select({ count: sql<number>`count(*)` }).from(meetings)
        .where(and(gte(meetings.date, now), eq(meetings.isPublished, true))),
      db.select({ count: sql<number>`count(*)` }).from(applications).where(eq(applications.status, 'pending')),
      db.select({ count: sql<number>`count(*)` }).from(serviceHours).where(eq(serviceHours.status, 'pending')),
      db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` }).from(transactions)
        .where(and(eq(transactions.type, 'income'), gte(transactions.date, yearStart))),
      db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` }).from(transactions)
        .where(and(eq(transactions.type, 'expense'), gte(transactions.date, yearStart))),
      db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.isActive, true)),
    ]);

    const totalMembers = Number(totalMembersResult[0].count);
    const newMembersThisMonth = Number(newMembersThisMonthResult[0].count);
    const newMembersLastMonth = Number(newMembersLastMonthResult[0].count);
    const memberGrowth = newMembersLastMonth === 0
      ? 100
      : Math.round(((newMembersThisMonth - newMembersLastMonth) / newMembersLastMonth) * 100);
    const totalIncome = Number(incomeResult[0].total);
    const totalExpense = Number(expenseResult[0].total);

    return res.json({
      totalMembers,
      newMembersThisMonth,
      memberGrowth,
      upcomingEvents: Number(upcomingEventsResult[0].count),
      upcomingMeetings: Number(upcomingMeetingsResult[0].count),
      pendingApplications: Number(pendingApplicationsResult[0].count),
      pendingServiceHours: Number(pendingServiceHoursResult[0].count),
      financials: { income: totalIncome, expenses: totalExpense, balance: totalIncome - totalExpense },
      activeMembersCount: Number(activeMembersResult[0].count),
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

    const [txRows, roleRows, serviceHourRows, topEventRows] = await Promise.all([
      db.select({ type: transactions.type, amount: transactions.amount, date: transactions.date })
        .from(transactions).where(gte(transactions.date, sixMonthsAgo)).orderBy(transactions.date),
      db.select({ role: users.role, count: sql<number>`count(*)` })
        .from(users).where(eq(users.isActive, true)).groupBy(users.role),
      db.select({ hours: serviceHours.hours, date: serviceHours.date })
        .from(serviceHours).where(and(eq(serviceHours.status, 'approved'), gte(serviceHours.date, sixMonthsAgo))),
      db.select({ id: events.id, title: events.title, startDate: events.startDate })
        .from(events).orderBy(sql`${events.startDate} desc`).limit(5),
    ]);

    // Group transactions by month
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = { income: 0, expense: 0 };
    }
    txRows.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyMap[key]) {
        if (t.type === 'income') monthlyMap[key].income += t.amount;
        else monthlyMap[key].expense += t.amount;
      }
    });
    const monthlyFinancials = Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data }));

    // Service hours by month
    const hoursMap: Record<string, number> = {};
    Object.keys(monthlyMap).forEach((k) => (hoursMap[k] = 0));
    serviceHourRows.forEach((h) => {
      const d = new Date(h.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (hoursMap[key] !== undefined) hoursMap[key] += h.hours;
    });
    const monthlyServiceHours = Object.entries(hoursMap).map(([month, hours]) => ({ month, hours }));

    // Top event bookings
    const eventIds = topEventRows.map((e) => e.id);
    const bookingCounts = eventIds.length
      ? await db.select({
          eventId: eventBookings.eventId,
          count: sql<number>`count(*)`,
        }).from(eventBookings)
          .where(and(inArray(eventBookings.eventId, eventIds), inArray(eventBookings.status, ['confirmed', 'checked_in'])))
          .groupBy(eventBookings.eventId)
      : [];

    const bookingMap: Record<string, number> = {};
    bookingCounts.forEach((b) => { bookingMap[b.eventId] = Number(b.count); });

    const topEvents = topEventRows.map((e) => ({ title: e.title, bookings: bookingMap[e.id] || 0 }));

    return res.json({
      monthlyFinancials,
      roleBreakdown: roleRows.map((r) => ({ role: r.role, count: Number(r.count) })),
      monthlyServiceHours,
      topEvents,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
