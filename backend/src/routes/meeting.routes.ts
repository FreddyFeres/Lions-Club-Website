import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { eq, gte, and, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { meetings, meetingAttendance, users } from '../db/schema';
import { authenticate, requireBoard, requireMember, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /meetings — List meetings
router.get('/', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '12', upcoming } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(meetings.isPublished, true)];
    if (upcoming === 'true') conditions.push(gte(meetings.date, new Date()));
    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      db.select().from(meetings).where(where).orderBy(sql`${meetings.date} desc`).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(meetings).where(where),
    ]);

    // Attach attendance count and current user's RSVP
    const meetingIds = rows.map((m) => m.id);
    const userId = req.user!.id;

    const [attendanceCounts, userRsvps] = await Promise.all([
      meetingIds.length
        ? db.select({ meetingId: meetingAttendance.meetingId, count: sql<number>`count(*)` })
            .from(meetingAttendance).where(and(...meetingIds.map(id => eq(meetingAttendance.meetingId, id)) as any))
            .groupBy(meetingAttendance.meetingId)
        : [],
      meetingIds.length
        ? db.select({ meetingId: meetingAttendance.meetingId, rsvpStatus: meetingAttendance.rsvpStatus, status: meetingAttendance.status })
            .from(meetingAttendance)
            .where(and(eq(meetingAttendance.userId, userId), sql`${meetingAttendance.meetingId} = ANY(${sql`ARRAY[${sql.join(meetingIds.map(id => sql`${id}`), sql`, `)}]::text[]`})`))
        : [],
    ]);

    const countMap: Record<string, number> = {};
    attendanceCounts.forEach((a: any) => { countMap[a.meetingId] = Number(a.count); });
    const rsvpMap: Record<string, any> = {};
    userRsvps.forEach((r: any) => { rsvpMap[r.meetingId] = { rsvpStatus: r.rsvpStatus, status: r.status }; });

    const data = rows.map((m) => ({
      ...m,
      _count: { attendance: countMap[m.id] || 0 },
      attendance: rsvpMap[m.id] ? [rsvpMap[m.id]] : [],
    }));

    return res.json({ data, total: Number(countResult[0].count), page: pageNum, limit: limitNum });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /meetings/my/rsvps — User's RSVPs
router.get('/my/rsvps', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const rsvps = await db.select({
      id: meetingAttendance.id, rsvpStatus: meetingAttendance.rsvpStatus,
      status: meetingAttendance.status, createdAt: meetingAttendance.createdAt,
      meeting: meetings,
    }).from(meetingAttendance)
      .leftJoin(meetings, eq(meetingAttendance.meetingId, meetings.id))
      .where(eq(meetingAttendance.userId, req.user!.id))
      .orderBy(sql`${meetingAttendance.createdAt} desc`);
    return res.json(rsvps);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /meetings/:id — Get meeting
router.get('/:id', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, req.params.id));
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const [[{ count }], userRsvp] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(meetingAttendance).where(eq(meetingAttendance.meetingId, req.params.id)),
      db.select({ rsvpStatus: meetingAttendance.rsvpStatus, status: meetingAttendance.status })
        .from(meetingAttendance)
        .where(and(eq(meetingAttendance.meetingId, req.params.id), eq(meetingAttendance.userId, req.user!.id))),
    ]);

    return res.json({ ...meeting, _count: { attendance: Number(count) }, attendance: userRsvp });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /meetings — Admin: create meeting
router.post('/', authenticate, requireBoard, upload.single('pvFile'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, date, agenda } = req.body;
    if (!title || !location || !date) return res.status(400).json({ message: 'Missing required fields' });

    const [meeting] = await db.insert(meetings).values({
      id: uuid(), title,
      description: description || null,
      location, date: new Date(date),
      agenda: agenda || null,
      pvFile: req.file ? `meetings/${req.file.filename}` : null,
    }).returning();
    return res.status(201).json(meeting);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /meetings/:id — Admin: update meeting
router.put('/:id', authenticate, requireBoard, upload.single('pvFile'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, date, agenda, isPublished } = req.body;
    const [existing] = await db.select().from(meetings).where(eq(meetings.id, req.params.id));
    if (!existing) return res.status(404).json({ message: 'Meeting not found' });

    if (req.file && existing.pvFile) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', existing.pvFile);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const [meeting] = await db.update(meetings).set({
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(location && { location }),
      ...(date && { date: new Date(date) }),
      ...(agenda !== undefined && { agenda }),
      ...(isPublished !== undefined && { isPublished: isPublished === 'true' || isPublished === true }),
      ...(req.file && { pvFile: `meetings/${req.file.filename}` }),
      updatedAt: new Date(),
    }).where(eq(meetings.id, req.params.id)).returning();
    return res.json(meeting);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /meetings/:id — Admin: delete meeting
router.delete('/:id', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const [meeting] = await db.select().from(meetings).where(eq(meetings.id, req.params.id));
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.pvFile) {
      const fp = path.join(process.env.UPLOAD_DIR || 'uploads', meeting.pvFile);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await db.delete(meetingAttendance).where(eq(meetingAttendance.meetingId, req.params.id));
    await db.delete(meetings).where(eq(meetings.id, req.params.id));
    return res.json({ message: 'Meeting deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /meetings/:id/rsvp — RSVP to meeting
router.post('/:id/rsvp', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const { rsvpStatus } = req.body;
    if (!['yes', 'no', 'maybe'].includes(rsvpStatus)) {
      return res.status(400).json({ message: 'Invalid RSVP status' });
    }
    const [existing] = await db.select().from(meetingAttendance)
      .where(and(eq(meetingAttendance.meetingId, req.params.id), eq(meetingAttendance.userId, req.user!.id)));

    let attendance;
    if (existing) {
      [attendance] = await db.update(meetingAttendance).set({ rsvpStatus, updatedAt: new Date() })
        .where(eq(meetingAttendance.id, existing.id)).returning();
    } else {
      [attendance] = await db.insert(meetingAttendance).values({
        id: uuid(), meetingId: req.params.id, userId: req.user!.id, rsvpStatus,
      }).returning();
    }
    return res.json(attendance);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /meetings/:id/attendance — Admin: attendance list
router.get('/:id/attendance', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const attendance = await db.select({
      id: meetingAttendance.id, rsvpStatus: meetingAttendance.rsvpStatus,
      status: meetingAttendance.status, createdAt: meetingAttendance.createdAt,
      user: {
        id: users.id, firstName: users.firstName, lastName: users.lastName,
        email: users.email, membershipNumber: users.membershipNumber, avatar: users.avatar,
      },
    }).from(meetingAttendance)
      .leftJoin(users, eq(meetingAttendance.userId, users.id))
      .where(eq(meetingAttendance.meetingId, req.params.id))
      .orderBy(meetingAttendance.rsvpStatus, meetingAttendance.createdAt);
    return res.json(attendance);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /meetings/:meetingId/attendance/:attendanceId/checkin — Admin: check in
router.patch('/:meetingId/attendance/:attendanceId/checkin', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!['present', 'absent', 'excused'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const [attendance] = await db.update(meetingAttendance).set({ status, updatedAt: new Date() })
      .where(eq(meetingAttendance.id, req.params.attendanceId)).returning();
    return res.json(attendance);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
