import { Router, Response } from 'express';
import prisma from '../prisma';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /applications — Submit membership application
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.application.findUnique({ where: { userId: req.user!.id } });
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

    const application = await prisma.application.create({
      data: {
        userId: req.user!.id,
        birthDate,
        statusType,
        fieldOfStudy,
        hasPastExperience: !!hasPastExperience,
        pastExperienceDetails: pastExperienceDetails || null,
        skills,
        motivation,
        discoveryChannel: JSON.stringify(discoveryChannel || []),
        availability: JSON.stringify(availability || []),
        readyForResponsibility: !!readyForResponsibility,
        status: 'pending',
      },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } } },
    });

    // Notify admins
    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'board_member'] } } });
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        title: 'Nouvelle candidature',
        message: `${req.user!.email} a soumis une demande d'adhésion au club.`,
        type: 'info',
        link: '/admin/applications',
      })),
    });

    return res.status(201).json({
      success: true,
      data: { ...application, discoveryChannel: JSON.parse(application.discoveryChannel), availability: JSON.parse(application.availability) },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /applications/my-application — Get own application
router.get('/my-application', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const application = await prisma.application.findUnique({
      where: { userId: req.user!.id },
    });
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
    const where: any = {};
    if (status) where.status = status;

    const applications = await prisma.application.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsed = applications.map((a) => ({
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

    const application = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });

    const statusMessages: Record<string, string> = {
      interviewed: 'Votre candidature a été retenue pour un entretien. Nous vous contacterons prochainement.',
      approved: 'Félicitations ! Votre candidature a été approuvée. Bienvenue dans le Lions Club !',
      rejected: 'Nous avons bien examiné votre candidature, mais nous ne pouvons pas vous accepter pour le moment.',
    };

    if (statusMessages[status]) {
      await prisma.notification.create({
        data: {
          userId: application.userId,
          title: 'Mise à jour de votre candidature',
          message: statusMessages[status],
          type: status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'info',
        },
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
