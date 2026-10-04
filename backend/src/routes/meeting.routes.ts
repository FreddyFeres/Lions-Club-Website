import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticate, requireBoard, requireMember, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /meetings — List meetings
router.get('/', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '12', upcoming } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { isPublished: true };
    if (upcoming === 'true') where.date = { gte: new Date() };

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
        include: {
          _count: { select: { attendance: true } },
          attendance: {
            where: { userId: req.user!.id },
            select: { rsvpStatus: true, status: true },
          },
        },
      }),
      prisma.meeting.count({ where }),
    ]);

    return res.json({ data: meetings, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /meetings/my/rsvps — User's RSVPs
router.get('/my/rsvps', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const rsvps = await prisma.meetingAttendance.findMany({
      where: { userId: req.user!.id },
      include: { meeting: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(rsvps);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /meetings/:id — Get meeting
router.get('/:id', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: req.params.id },
      include: {
        attendance: {
          where: { userId: req.user!.id },
          select: { rsvpStatus: true, status: true },
        },
        _count: { select: { attendance: true } },
      },
    });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    return res.json(meeting);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /meetings — Admin: create meeting
router.post('/', authenticate, requireBoard, upload.single('pvFile'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, date, agenda } = req.body;
    if (!title || !location || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const meeting = await prisma.meeting.create({
      data: {
        title,
        description: description || null,
        location,
        date: new Date(date),
        agenda: agenda || null,
        pvFile: req.file ? `meetings/${req.file.filename}` : null,
      },
    });
    return res.status(201).json(meeting);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /meetings/:id — Admin: update meeting
router.put('/:id', authenticate, requireBoard, upload.single('pvFile'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, date, agenda, isPublished } = req.body;
    const existing = await prisma.meeting.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Meeting not found' });

    if (req.file && existing.pvFile) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', existing.pvFile);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const meeting = await prisma.meeting.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(location && { location }),
        ...(date && { date: new Date(date) }),
        ...(agenda !== undefined && { agenda }),
        ...(isPublished !== undefined && { isPublished: isPublished === 'true' || isPublished === true }),
        ...(req.file && { pvFile: `meetings/${req.file.filename}` }),
      },
    });
    return res.json(meeting);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /meetings/:id — Admin: delete meeting
router.delete('/:id', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const meeting = await prisma.meeting.findUnique({ where: { id: req.params.id } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });
    if (meeting.pvFile) {
      const fp = path.join(process.env.UPLOAD_DIR || 'uploads', meeting.pvFile);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await prisma.meeting.delete({ where: { id: req.params.id } });
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
    const attendance = await prisma.meetingAttendance.upsert({
      where: { meetingId_userId: { meetingId: req.params.id, userId: req.user!.id } },
      update: { rsvpStatus },
      create: { meetingId: req.params.id, userId: req.user!.id, rsvpStatus },
    });
    return res.json(attendance);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /meetings/:id/attendance — Admin: attendance list
router.get('/:id/attendance', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const attendance = await prisma.meetingAttendance.findMany({
      where: { meetingId: req.params.id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, membershipNumber: true, avatar: true },
        },
      },
      orderBy: [{ rsvpStatus: 'asc' }, { createdAt: 'asc' }],
    });
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
    const attendance = await prisma.meetingAttendance.update({
      where: { id: req.params.attendanceId },
      data: { status },
    });
    return res.json(attendance);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
