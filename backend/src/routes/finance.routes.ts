import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /finances/donations — Public: recent donations
router.get('/donations', async (req: Request, res: Response) => {
  try {
    const donations = await prisma.donation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    return res.json(donations);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /finances/donations — Public: submit a donation
router.post('/donations', async (req: Request, res: Response) => {
  try {
    const { name, email, amount, message, anonymous } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const donation = await prisma.donation.create({
      data: {
        name: anonymous ? null : name,
        email: anonymous ? null : email,
        amount: parseFloat(amount),
        message: message || null,
        anonymous: !!anonymous,
      },
    });

    // Also record as income transaction
    await prisma.transaction.create({
      data: {
        type: 'income',
        category: 'donations',
        amount: parseFloat(amount),
        description: `Don${anonymous ? ' anonyme' : name ? ` de ${name}` : ''}`,
        date: new Date(),
      },
    });

    return res.status(201).json(donation);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /finances/transactions — Admin: ledger
router.get('/transactions', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, page = '1', limit = '20' } = req.query as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { date: 'desc' },
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return res.json({ data: transactions, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /finances/summary — Admin: financial summary
router.get('/summary', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);

    const [incomeAgg, expenseAgg, monthlyData, categoryData, donationsTotal] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'income', date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'expense', date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['type'],
        where: { date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['category', 'type'],
        where: { date: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
      }),
      prisma.donation.aggregate({
        where: { createdAt: { gte: yearStart, lte: yearEnd } },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    const totalIncome = incomeAgg._sum.amount || 0;
    const totalExpense = expenseAgg._sum.amount || 0;

    return res.json({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      donationsTotal: donationsTotal._sum.amount || 0,
      donationsCount: donationsTotal._count,
      categoryBreakdown: categoryData,
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /finances/transactions — Admin: create transaction
router.post('/transactions', authenticate, requireBoard, upload.single('receipt'), async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, amount, description, date } = req.body;
    if (!type || !category || !amount || !description || !date) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const transaction = await prisma.transaction.create({
      data: {
        type,
        category,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        receipt: req.file ? `receipts/${req.file.filename}` : null,
        userId: req.user!.id,
      },
    });
    return res.status(201).json(transaction);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /finances/transactions/:id — Admin: update transaction
router.put('/transactions/:id', authenticate, requireBoard, upload.single('receipt'), async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, amount, description, date } = req.body;
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Transaction not found' });

    if (req.file && existing.receipt) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', existing.receipt);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const transaction = await prisma.transaction.update({
      where: { id: req.params.id },
      data: {
        ...(type && { type }),
        ...(category && { category }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(req.file && { receipt: `receipts/${req.file.filename}` }),
      },
    });
    return res.json(transaction);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /finances/transactions/:id — Admin: delete transaction
router.delete('/transactions/:id', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ message: 'Transaction not found' });
    if (existing.receipt) {
      const fp = path.join(process.env.UPLOAD_DIR || 'uploads', existing.receipt);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await prisma.transaction.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Transaction deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
