import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';
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
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashed, firstName, lastName, phone, role: 'normal_user' },
    });

    const { accessToken, refreshToken } = signTokens(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

    // Welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Bienvenue !',
        message: `Bienvenue ${firstName} ! Votre compte a été créé avec succès.`,
        type: 'success',
      },
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

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const { accessToken, refreshToken } = signTokens(user.id);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

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

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const tokens = signTokens(decoded.id);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({ data: { token: tokens.refreshToken, userId: decoded.id, expiresAt } });

    return res.json(tokens);
  } catch (e) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
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

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    return res.json({ message: 'Logged out successfully' });
  } catch {
    return res.json({ message: 'Logged out' });
  }
});

export default router;
