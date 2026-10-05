import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import db from '../db';
import { donations, transactions, users } from '../db/schema';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /finances/donations — Public: recent donations
router.get('/donations', async (req: Request, res: Response) => {
  try {
    const rows = await db.select().from(donations).orderBy(sql`${donations.createdAt} desc`).limit(20);
    return res.json(rows);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /finances/donations — Public: submit a donation
router.post('/donations', async (req: Request, res: Response) => {
  try {
    const { name, email, amount, message, anonymous } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const [donation] = await db.insert(donations).values({
      id: uuid(),
      name: anonymous ? null : name,
      email: anonymous ? null : email,
      amount: parseFloat(amount),
      message: message || null,
      anonymous: !!anonymous,
    }).returning();

    await db.insert(transactions).values({
      id: uuid(), type: 'income', category: 'donations',
      amount: parseFloat(amount),
      description: `Don${anonymous ? ' anonyme' : name ? ` de ${name}` : ''}`,
      date: new Date(),
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
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    const conditions: any[] = [];
    if (type) conditions.push(eq(transactions.type, type));
    if (category) conditions.push(eq(transactions.category, category));
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, countResult] = await Promise.all([
      db.select({
        id: transactions.id, type: transactions.type, category: transactions.category,
        amount: transactions.amount, description: transactions.description,
        date: transactions.date, receipt: transactions.receipt, createdAt: transactions.createdAt,
        user: {
          id: users.id, firstName: users.firstName, lastName: users.lastName,
        },
      }).from(transactions)
        .leftJoin(users, eq(transactions.userId, users.id))
        .where(where).orderBy(sql`${transactions.date} desc`).limit(limitNum).offset(offset),
      db.select({ count: sql<number>`count(*)` }).from(transactions).where(where),
    ]);

    return res.json({ data: rows, total: Number(countResult[0].count), page: pageNum, limit: limitNum });
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

    const [incomeResult, expenseResult, categoryResult, donationsResult] = await Promise.all([
      db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions).where(and(eq(transactions.type, 'income'), gte(transactions.date, yearStart), lte(transactions.date, yearEnd))),
      db.select({ total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)` })
        .from(transactions).where(and(eq(transactions.type, 'expense'), gte(transactions.date, yearStart), lte(transactions.date, yearEnd))),
      db.select({
        category: transactions.category, type: transactions.type,
        total: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
      }).from(transactions)
        .where(and(gte(transactions.date, yearStart), lte(transactions.date, yearEnd)))
        .groupBy(transactions.category, transactions.type),
      db.select({
        total: sql<number>`COALESCE(SUM(${donations.amount}), 0)`,
        count: sql<number>`count(*)`,
      }).from(donations).where(and(gte(donations.createdAt, yearStart), lte(donations.createdAt, yearEnd))),
    ]);

    const totalIncome = Number(incomeResult[0].total);
    const totalExpense = Number(expenseResult[0].total);

    return res.json({
      totalIncome, totalExpense,
      balance: totalIncome - totalExpense,
      donationsTotal: Number(donationsResult[0].total),
      donationsCount: Number(donationsResult[0].count),
      categoryBreakdown: categoryResult,
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
    const [transaction] = await db.insert(transactions).values({
      id: uuid(), type, category,
      amount: parseFloat(amount), description, date: new Date(date),
      receipt: req.file ? `receipts/${req.file.filename}` : null,
      userId: req.user!.id,
    }).returning();
    return res.status(201).json(transaction);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// PUT /finances/transactions/:id — Admin: update transaction
router.put('/transactions/:id', authenticate, requireBoard, upload.single('receipt'), async (req: AuthRequest, res: Response) => {
  try {
    const { type, category, amount, description, date } = req.body;
    const [existing] = await db.select().from(transactions).where(eq(transactions.id, req.params.id));
    if (!existing) return res.status(404).json({ message: 'Transaction not found' });

    if (req.file && existing.receipt) {
      const old = path.join(process.env.UPLOAD_DIR || 'uploads', existing.receipt);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    const [transaction] = await db.update(transactions).set({
      ...(type && { type }),
      ...(category && { category }),
      ...(amount && { amount: parseFloat(amount) }),
      ...(description && { description }),
      ...(date && { date: new Date(date) }),
      ...(req.file && { receipt: `receipts/${req.file.filename}` }),
      updatedAt: new Date(),
    }).where(eq(transactions.id, req.params.id)).returning();
    return res.json(transaction);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /finances/transactions/:id — Admin: delete transaction
router.delete('/transactions/:id', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const [existing] = await db.select().from(transactions).where(eq(transactions.id, req.params.id));
    if (!existing) return res.status(404).json({ message: 'Transaction not found' });
    if (existing.receipt) {
      const fp = path.join(process.env.UPLOAD_DIR || 'uploads', existing.receipt);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await db.delete(transactions).where(eq(transactions.id, req.params.id));
    return res.json({ message: 'Transaction deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
