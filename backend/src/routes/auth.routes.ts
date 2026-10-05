import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';
import db from '../db';
import { users, refreshTokens, notifications } from '../db/schema';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const signTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });
  return { accessToken, refreshToken };
};

// POST /auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const [existing] = await db.select().from(users).where(eq(users.email, email));
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const id = uuid();
    const [user] = await db.insert(users).values({
      id, email, password: hashed, firstName, lastName, phone: phone || null, role: 'normal_user',
    }).returning();

    const { accessToken, refreshToken } = signTokens(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({ id: uuid(), token: refreshToken, userId: user.id, expiresAt });

    await db.insert(notifications).values({
      id: uuid(), userId: user.id,
      title: 'Bienvenue !',
      message: `Bienvenue ${firstName} ! Votre compte a été créé avec succès.`,
      type: 'success',
    });

    const { password: _, ...safeUser } = user;
    return res.status(201).json({ user: safeUser, accessToken, refreshToken });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = signTokens(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({ id: uuid(), token: refreshToken, userId: user.id, expiresAt });

    const { password: _, ...safeUser } = user;
    return res.json({ user: safeUser, accessToken, refreshToken });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' });

    const [stored] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const tokens = signTokens(decoded.id);

    await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({ id: uuid(), token: tokens.refreshToken, userId: decoded.id, expiresAt });

    return res.json(tokens);
  } catch (e) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
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

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await db.delete(refreshTokens).where(eq(refreshTokens.token, refreshToken));
    }
    return res.json({ message: 'Logged out successfully' });
  } catch {
    return res.json({ message: 'Logged out' });
  }
});

export default router;
