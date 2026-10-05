import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { eq, ilike, or, isNotNull, and, inArray, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { users, notifications } from '../db/schema';
import { authenticate, requireAdmin, requireBoard, requireMember, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

const safeUserSelect = {
  id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
  role: users.role, avatar: users.avatar, membershipNumber: users.membershipNumber,
  phone: users.phone, isActive: users.isActive, duesPaidUntil: users.duesPaidUntil,
  occupation: users.occupation, createdAt: users.createdAt,
};

// GET /users — Admin: all users
router.get('/', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { search, role, page = '1', limit = '20' } = req.query as any;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (search) {
      conditions.push(or(
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.membershipNumber, `%${search}%`),
      ));
    }
    if (role) conditions.push(eq(users.role, role));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      db.select(safeUserSelect).from(users).where(where).orderBy(sql`${users.createdAt} desc`).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(users).where(where),
    ]);

    return res.json({ data: rows, total: Number(countResult[0].count), page: pageNum, limit: limitNum });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/export — CSV export
router.get('/export', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const rows = await db.select({
      membershipNumber: users.membershipNumber, firstName: users.firstName, lastName: users.lastName,
      email: users.email, phone: users.phone, role: users.role,
      duesPaidUntil: users.duesPaidUntil, isActive: users.isActive, createdAt: users.createdAt,
    }).from(users).orderBy(users.membershipNumber);

    const headers = ['N° Membre', 'Prénom', 'Nom', 'Email', 'Téléphone', 'Rôle', "Cotisation jusqu'au", 'Actif', 'Inscrit le'];
    const csvRows = rows.map((u) => [
      u.membershipNumber || '', u.firstName, u.lastName, u.email, u.phone || '', u.role,
      u.duesPaidUntil ? new Date(u.duesPaidUntil).toLocaleDateString('fr-FR') : '',
      u.isActive ? 'Oui' : 'Non',
      new Date(u.createdAt).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers, ...csvRows].map((r) => r.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=membres.csv');
    return res.send('\uFEFF' + csv);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/directory — Members: public directory
router.get('/directory', authenticate, requireMember, async (req: AuthRequest, res: Response) => {
  try {
    const { search } = req.query as any;
    const conditions: any[] = [
      eq(users.isActive, true),
      inArray(users.role, ['admin', 'board_member', 'club_member']),
    ];
    if (search) {
      conditions.push(or(
        ilike(users.firstName, `%${search}%`),
        ilike(users.lastName, `%${search}%`),
        ilike(users.occupation, `%${search}%`),
      ));
    }
    const rows = await db.select({
      id: users.id, firstName: users.firstName, lastName: users.lastName,
      avatar: users.avatar, role: users.role, occupation: users.occupation,
      phone: users.phone, email: users.email, membershipNumber: users.membershipNumber,
    }).from(users).where(and(...conditions)).orderBy(users.lastName, users.firstName);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/profile — Get own profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [user] = await db.select({
      id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
      role: users.role, avatar: users.avatar, membershipNumber: users.membershipNumber,
      phone: users.phone, bio: users.bio, address: users.address, occupation: users.occupation,
      duesPaidUntil: users.duesPaidUntil, isActive: users.isActive, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, req.user!.id));
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /users/:id — Get user by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const targetId = req.params.id === 'me' ? req.user!.id : req.params.id;
    const [user] = await db.select({
      id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
      role: users.role, avatar: users.avatar, membershipNumber: users.membershipNumber,
      phone: users.phone, bio: users.bio, address: users.address, occupation: users.occupation,
      duesPaidUntil: users.duesPaidUntil, isActive: users.isActive, createdAt: users.createdAt,
    }).from(users).where(eq(users.id, targetId));
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
    const [user] = await db.update(users)
      .set({ firstName, lastName, phone, bio, address, occupation, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id))
      .returning({
        id: users.id, email: users.email, firstName: users.firstName, lastName: users.lastName,
        role: users.role, avatar: users.avatar, membershipNumber: users.membershipNumber,
        phone: users.phone, bio: users.bio, address: users.address, occupation: users.occupation,
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

    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id));
    if (user?.avatar) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', user.avatar);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const avatarPath = `avatars/${req.file.filename}`;
    const [updated] = await db.update(users)
      .set({ avatar: avatarPath, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id))
      .returning({ id: users.id, avatar: users.avatar });
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

    const [targetUser] = await db.select().from(users).where(eq(users.id, req.params.id));
    let membershipNumber: string | undefined;
    if (!targetUser?.membershipNumber && ['club_member', 'board_member', 'admin'].includes(role)) {
      const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(users).where(isNotNull(users.membershipNumber));
      membershipNumber = `LC-${String(Number(count) + 1).padStart(4, '0')}`;
    }

    const [user] = await db.update(users)
      .set({ role, ...(membershipNumber ? { membershipNumber } : {}), updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning({
        id: users.id, email: users.email, firstName: users.firstName,
        lastName: users.lastName, role: users.role, membershipNumber: users.membershipNumber,
      });

    await db.insert(notifications).values({
      id: uuid(), userId: req.params.id,
      title: 'Rôle mis à jour',
      message: `Votre rôle a été mis à jour : ${role.replace('_', ' ')}.`,
      type: 'info',
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
    const [user] = await db.update(users)
      .set({ duesPaidUntil: duesPaidUntil ? new Date(duesPaidUntil) : null, updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning({ id: users.id, duesPaidUntil: users.duesPaidUntil });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PATCH /users/:id/deactivate — Admin: toggle active status
router.patch('/:id/deactivate', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { isActive } = req.body;
    const [user] = await db.update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, req.params.id))
      .returning({ id: users.id, isActive: users.isActive, firstName: users.firstName, lastName: users.lastName });
    return res.json(user);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
