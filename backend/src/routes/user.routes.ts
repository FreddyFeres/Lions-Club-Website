import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticate, requireAdmin, requireBoard, requireMember, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /users — Admin: all users
router.get('/', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { membershipNumber: { contains: search } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, firstName: true, lastName: true,
          role: true, avatar: true, membershipNumber: true,
          phone: true, isActive: true, duesPaidUntil: true,
          occupation: true, createdAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({ data: users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/export — Admin: CSV export
router.get('/export', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        membershipNumber: true, firstName: true, lastName: true,
        email: true, phone: true, role: true, duesPaidUntil: true,
        isActive: true, createdAt: true,
      },
      orderBy: { membershipNumber: 'asc' },
    });

    const headers = ['N° Membre', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Rôle', 'Cotisation jusqu\'au', 'Actif', 'Inscrit le'];
    const rows = users.map((u) => [
      u.membershipNumber || '',
      u.firstName,
      u.lastName,
      u.email,
      u.phone || '',
      u.role,
      u.duesPaidUntil ? new Date(u.duesPaidUntil).toLocaleDateString('fr-FR') : '',
      u.isActive ? 'Oui' : 'Non',
      new Date(u.createdAt).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=membres.csv');
    return res.send('\uFEFF' + csv); // BOM for Excel
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/directory — Members: public directory
router.get('/directory', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query as any;
    const where: any = { isActive: true, role: { in: ['admin', 'board_member', 'club_member'] } };
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { occupation: { contains: search } },
      ];
    }
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true, firstName: true, lastName: true, avatar: true,
        role: true, occupation: true, phone: true, email: true,
        membershipNumber: true,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/profile — Get own profile (alias)
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatar: true, membershipNumber: true,
        phone: true, bio: true, address: true, occupation: true,
        duesPaidUntil: true, isActive: true, createdAt: true,
      },
    });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id — Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = req.params.id === 'me' ? req.user!.id : req.params.id;
    const user = await prisma.user.findUnique({
      where: { id: targetId },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatar: true, membershipNumber: true,
        phone: true, bio: true, address: true, occupation: true,
        duesPaidUntil: true, isActive: true, createdAt: true,
      },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /users/profile — Update own profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, bio, address, occupation } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { firstName, lastName, phone, bio, address, occupation },
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, avatar: true, membershipNumber: true,
        phone: true, bio: true, address: true, occupation: true,
      },
    });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /users/profile/avatar — Upload avatar
router.patch('/profile/avatar', authenticate, upload.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    // Delete old avatar if exists
    if (user?.avatar) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', user.avatar);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const avatarPath = `avatars/${req.file.filename}`;
    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { avatar: avatarPath },
      select: { id: true, avatar: true },
    });
    return res.json(updated);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /users/:id/promote — Admin: promote/demote user
router.patch('/:id/promote', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'board_member', 'club_member', 'normal_user'];
    if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });

    // Generate membership number for new members
    let membershipNumber: string | undefined;
    const targetUser = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!targetUser?.membershipNumber && ['club_member', 'board_member', 'admin'].includes(role)) {
      const count = await prisma.user.count({ where: { membershipNumber: { not: null } } });
      membershipNumber = `LC-${String(count + 1).padStart(4, '0')}`;
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role, ...(membershipNumber ? { membershipNumber } : {}) },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, membershipNumber: true },
    });

    await prisma.notification.create({
      data: {
        userId: req.params.id,
        title: 'Rôle mis à jour',
        message: `Votre rôle a été mis à jour : ${role.replace('_', ' ')}.`,
        type: 'info',
      },
    });

    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /users/:id/dues — Admin: update dues
router.patch('/:id/dues', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { duesPaidUntil } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { duesPaidUntil: duesPaidUntil ? new Date(duesPaidUntil) : null },
      select: { id: true, duesPaidUntil: true },
    });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /users/:id/deactivate — Admin: toggle active status
router.patch('/:id/deactivate', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isActive },
      select: { id: true, isActive: true, firstName: true, lastName: true },
    });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
