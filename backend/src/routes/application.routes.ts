import { Router, Response } from 'express';
import { eq, and, inArray, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { applications, users, notifications } from '../db/schema';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /applications — Submit membership application
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [existing] = await db.select().from(applications).where(eq(applications.userId, req.user!.id));
    if (existing) {
      return res.status(409).json({ success: false, message: 'You have already submitted an application' });
    }

    const {
      birthDate, statusType, fieldOfStudy, hasPastExperience,
      pastExperienceDetails, skills, motivation, discoveryChannel,
      availability, readyForResponsibility,
    } = req.body;

    if (!birthDate || !statusType || !fieldOfStudy || !skills || !motivation) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const [application] = await db.insert(applications).values({
      id: uuid(), userId: req.user!.id, birthDate, statusType, fieldOfStudy,
      hasPastExperience: !!hasPastExperience,
      pastExperienceDetails: pastExperienceDetails || null,
      skills, motivation,
      discoveryChannel: JSON.stringify(discoveryChannel || []),
      availability: JSON.stringify(availability || []),
      readyForResponsibility: !!readyForResponsibility,
      status: 'pending',
    }).returning();

    // Notify admins
    const admins = await db.select({ id: users.id }).from(users)
      .where(inArray(users.role, ['admin', 'board_member']));

    if (admins.length) {
      await db.insert(notifications).values(admins.map((admin) => ({
        id: uuid(), userId: admin.id,
        title: 'Nouvelle candidature',
        message: `${req.user!.email} a soumis une demande d'adhésion au club.`,
        type: 'info',
        link: '/admin/applications',
      })));
    }

    return res.status(201).json({
      success: true,
      data: {
        ...application,
        discoveryChannel: JSON.parse(application.discoveryChannel),
        availability: JSON.parse(application.availability),
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /applications/my-application — Get own application
router.get('/my-application', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [application] = await db.select().from(applications).where(eq(applications.userId, req.user!.id));
    if (!application) return res.json({ success: true, data: null });

    return res.json({
      success: true,
      data: {
        ...application,
        discoveryChannel: JSON.parse(application.discoveryChannel),
        availability: JSON.parse(application.availability),
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /applications — Admin: all applications
router.get('/', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query as any;
    const conditions: any[] = [];
    if (status) conditions.push(eq(applications.status, status));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db.select({
      id: applications.id, userId: applications.userId, birthDate: applications.birthDate,
      statusType: applications.statusType, fieldOfStudy: applications.fieldOfStudy,
      hasPastExperience: applications.hasPastExperience,
      pastExperienceDetails: applications.pastExperienceDetails,
      skills: applications.skills, motivation: applications.motivation,
      discoveryChannel: applications.discoveryChannel, availability: applications.availability,
      readyForResponsibility: applications.readyForResponsibility,
      status: applications.status, createdAt: applications.createdAt, updatedAt: applications.updatedAt,
      user: {
        id: users.id, firstName: users.firstName, lastName: users.lastName,
        email: users.email, phone: users.phone,
      },
    }).from(applications)
      .leftJoin(users, eq(applications.userId, users.id))
      .where(where).orderBy(sql`${applications.createdAt} desc`);

    const parsed = rows.map((a) => ({
      ...a,
      discoveryChannel: JSON.parse(a.discoveryChannel),
      availability: JSON.parse(a.availability),
    }));

    return res.json({ success: true, data: parsed });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /applications/:id/status — Admin: update status
router.put('/:id/status', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'interviewed', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const [application] = await db.update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, req.params.id)).returning();

    const statusMessages: Record<string, string> = {
      interviewed: 'Votre candidature a été retenue pour un entretien. Nous vous contacterons prochainement.',
      approved: 'Félicitations ! Votre candidature a été approuvée. Bienvenue dans le Lions Club !',
      rejected: 'Nous avons bien examiné votre candidature, mais nous ne pouvons pas vous accepter pour le moment.',
    };

    if (statusMessages[status]) {
      await db.insert(notifications).values({
        id: uuid(), userId: application.userId,
        title: 'Mise à jour de votre candidature',
        message: statusMessages[status],
        type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
      });
    }

    return res.json({
      success: true,
      data: {
        ...application,
        discoveryChannel: JSON.parse(application.discoveryChannel),
        availability: JSON.parse(application.availability),
      },
    });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
