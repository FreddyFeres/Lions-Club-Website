import { Router, Request, Response } from 'express';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';
import { eq, gte, and, sql, inArray } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { events, eventBookings, users } from '../db/schema';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /events — Public: list events
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, upcoming, page = '1', limit = '12' } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [eq(events.isPublished, true)];
    if (category) conditions.push(eq(events.category, category));
    if (upcoming === 'true') conditions.push(gte(events.startDate, new Date()));

    const where = and(...conditions);

    const [rows, countResult] = await Promise.all([
      db.select().from(events).where(where).orderBy(events.startDate).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(events).where(where),
    ]);

    // Get confirmed booking counts per event
    const eventIds = rows.map((e) => e.id);
    const bookingCounts = eventIds.length
      ? await db.select({
          eventId: eventBookings.eventId,
          count: sql<number>`count(*)`,
        }).from(eventBookings)
          .where(and(inArray(eventBookings.eventId, eventIds), eq(eventBookings.status, 'confirmed')))
          .groupBy(eventBookings.eventId)
      : [];

    const countMap: Record<string, number> = {};
    bookingCounts.forEach((b) => { countMap[b.eventId] = Number(b.count); });

    const data = rows.map((e) => ({ ...e, _count: { bookings: countMap[e.id] || 0 } }));

    return res.json({ data, total: Number(countResult[0].count), page: pageNum, limit: limitNum });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/my/bookings — User's own bookings
router.get('/my/bookings', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await db.select({
      id: eventBookings.id, status: eventBookings.status, createdAt: eventBookings.createdAt,
      event: events,
    }).from(eventBookings)
      .leftJoin(events, eq(eventBookings.eventId, events.id))
      .where(eq(eventBookings.userId, req.user!.id))
      .orderBy(sql`${eventBookings.createdAt} desc`);
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/:slug — Get event by slug
router.get('/:slug', async (req: Request, res: Response) => {
  try {
    const [event] = await db.select().from(events).where(eq(events.slug, req.params.slug));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(eventBookings)
      .where(and(eq(eventBookings.eventId, event.id), eq(eventBookings.status, 'confirmed')));
    return res.json({ ...event, _count: { bookings: Number(count) } });
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
    const [existing] = await db.select().from(events).where(eq(events.slug, slug));
    if (existing) slug = `${slug}-${Date.now()}`;

    const [event] = await db.insert(events).values({
      id: uuid(), title, slug, description, location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      category: category || 'general',
      capacity: capacity ? parseInt(capacity) : null,
      image: req.file ? `events/${req.file.filename}` : null,
    }).returning();
    return res.status(201).json(event);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /events/:id — Admin: update event
router.put('/:id', authenticate, requireBoard, upload.single('image'), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, location, startDate, endDate, category, capacity, isPublished } = req.body;
    const [existing] = await db.select().from(events).where(eq(events.id, req.params.id));
    if (!existing) return res.status(404).json({ message: 'Event not found' });

    if (req.file && existing.image) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', existing.image);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const [event] = await db.update(events).set({
      ...(title && { title }),
      ...(description && { description }),
      ...(location && { location }),
      ...(startDate && { startDate: new Date(startDate) }),
      ...(endDate && { endDate: new Date(endDate) }),
      ...(category && { category }),
      ...(capacity && { capacity: parseInt(capacity) }),
      ...(isPublished !== undefined && { isPublished: isPublished === 'true' || isPublished === true }),
      ...(req.file && { image: `events/${req.file.filename}` }),
      updatedAt: new Date(),
    }).where(eq(events.id, req.params.id)).returning();
    return res.json(event);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /events/:id — Admin: delete event
router.delete('/:id', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.image) {
      const imgPath = path.join(process.env.UPLOAD_DIR || 'uploads', event.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await db.delete(eventBookings).where(eq(eventBookings.eventId, req.params.id));
    await db.delete(events).where(eq(events.id, req.params.id));
    return res.json({ message: 'Event deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /events/:id/book — Book an event
router.post('/:id/book', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [event] = await db.select().from(events).where(eq(events.id, req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.capacity) {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(eventBookings)
        .where(and(eq(eventBookings.eventId, req.params.id), eq(eventBookings.status, 'confirmed')));
      if (Number(count) >= event.capacity) return res.status(400).json({ message: 'Event is fully booked' });
    }

    // Upsert: update if exists, insert if not
    const [existing] = await db.select().from(eventBookings)
      .where(and(eq(eventBookings.userId, req.user!.id), eq(eventBookings.eventId, req.params.id)));

    let booking;
    if (existing) {
      [booking] = await db.update(eventBookings).set({ status: 'confirmed' })
        .where(eq(eventBookings.id, existing.id)).returning();
    } else {
      [booking] = await db.insert(eventBookings).values({
        id: uuid(), userId: req.user!.id, eventId: req.params.id, status: 'confirmed',
      }).returning();
    }
    return res.status(201).json(booking);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /events/:id/book — Cancel booking
router.delete('/:id/book', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await db.update(eventBookings).set({ status: 'cancelled' })
      .where(and(eq(eventBookings.userId, req.user!.id), eq(eventBookings.eventId, req.params.id)));
    return res.json({ message: 'Booking cancelled' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /events/:id/bookings — Admin: all bookings for event
router.get('/:id/bookings', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await db.select({
      id: eventBookings.id, status: eventBookings.status, createdAt: eventBookings.createdAt,
      user: {
        id: users.id, firstName: users.firstName, lastName: users.lastName,
        email: users.email, phone: users.phone, membershipNumber: users.membershipNumber,
      },
    }).from(eventBookings)
      .leftJoin(users, eq(eventBookings.userId, users.id))
      .where(eq(eventBookings.eventId, req.params.id))
      .orderBy(eventBookings.createdAt);
    return res.json(bookings);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /events/:eventId/bookings/:bookingId/checkin — Admin: check in
router.patch('/:eventId/bookings/:bookingId/checkin', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const [booking] = await db.update(eventBookings).set({ status: 'checked_in' })
      .where(eq(eventBookings.id, req.params.bookingId)).returning();
    return res.json(booking);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
