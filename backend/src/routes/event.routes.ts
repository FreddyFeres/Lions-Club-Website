import { Router, Request, Response } from 'express';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /events — Public: list events
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, upcoming, page = '1', limit = '12' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { isPublished: true };
    if (category) where.category = category;
    if (upcoming === 'true') where.startDate = { gte: new Date() };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { startDate: 'asc' },
        include: { _count: { select: { bookings: { where: { status: 'confirmed' } } } } },
      }),
      prisma.event.count({ where }),
    ]);

    return res.json({ data: events, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/my/bookings — User's own bookings
router.get('/my/bookings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.eventBooking.findMany({
      where: { userId: req.user!.id },
      include: { event: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/:slug — Get event by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.slug },
      include: { _count: { select: { bookings: { where: { status: 'confirmed' } } } } },
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    return res.json(event);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /events — Admin: create event
router.post('/', authenticate, requireBoard, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, startDate, endDate, category, capacity } = req.body;
    if (!title || !description || !location || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    let slug = slugify(title, { lower: true, strict: true });
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        category: category || 'general',
        capacity: capacity ? parseInt(capacity) : null,
        image: req.file ? `events/${req.file.filename}` : null,
      },
    });
    return res.status(201).json(event);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /events/:id — Admin: update event
router.put('/:id', authenticate, requireBoard, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, startDate, endDate, category, capacity, isPublished } = req.body;
    const existing = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    if (req.file && existing.image) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', existing.image);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(category && { category }),
        ...(capacity && { capacity: parseInt(capacity) }),
        ...(isPublished !== undefined && { isPublished: isPublished === 'true' || isPublished === true }),
        ...(req.file && { image: `events/${req.file.filename}` }),
      },
    });
    return res.json(event);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /events/:id — Admin: delete event
router.delete('/:id', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.image) {
      const imgPath = path.join(process.env.UPLOAD_DIR || 'uploads', event.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await prisma.event.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Event deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /events/:id/book — Book an event
router.post('/:id/book', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { bookings: { where: { status: 'confirmed' } } } } },
    });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.capacity && event._count.bookings >= event.capacity) {
      return res.status(400).json({ message: 'Event is fully booked' });
    }

    const booking = await prisma.eventBooking.upsert({
      where: { userId_eventId: { userId: req.user!.id, eventId: req.params.id } },
      update: { status: 'confirmed' },
      create: { userId: req.user!.id, eventId: req.params.id, status: 'confirmed' },
    });
    return res.status(201).json(booking);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /events/:id/book — Cancel booking
router.delete('/:id/book', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.eventBooking.updateMany({
      where: { userId: req.user!.id, eventId: req.params.id },
      data: { status: 'cancelled' },
    });
    return res.json({ message: 'Booking cancelled' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/:id/bookings — Admin: all bookings for event
router.get('/:id/bookings', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await prisma.eventBooking.findMany({
      where: { eventId: req.params.id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true, membershipNumber: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /events/:eventId/bookings/:bookingId/checkin — Admin: check in
router.patch('/:eventId/bookings/:bookingId/checkin', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const booking = await prisma.eventBooking.update({
      where: { id: req.params.bookingId },
      data: { status: 'checked_in' },
    });
    return res.json(booking);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
