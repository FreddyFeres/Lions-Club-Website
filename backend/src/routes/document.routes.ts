import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import { authenticate, requireBoard, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// GET /documents — List documents
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.query as any;
    const isAdmin = ['admin', 'board_member'].includes(req.user!.role);
    const where: any = {};
    if (!isAdmin) where.isPublic = true;
    if (category) where.category = category;

    const documents = await prisma.document.findMany({
      where,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(documents);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// POST /documents — Admin: upload document
router.post('/', authenticate, requireBoard, upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const { title, category, isPublic } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });

    const document = await prisma.document.create({
      data: {
        title,
        category: category || 'general',
        fileUrl: `documents/${req.file.filename}`,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user!.id,
        isPublic: isPublic === 'true' || isPublic === true,
      },
    });
    return res.status(201).json(document);
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /documents/:id — Admin: delete document
router.delete('/:id', authenticate, requireBoard, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const fp = path.join(process.env.UPLOAD_DIR || 'uploads', doc.fileUrl);
    if (fs.existsSync(fp)) fs.unlinkSync(fp);

    await prisma.document.delete({ where: { id: req.params.id } });
    return res.json({ message: 'Document deleted' });
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

// GET /documents/:id/download — Download document
router.get('/:id/download', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    const isAdmin = ['admin', 'board_member'].includes(req.user!.role);
    if (!doc.isPublic && !isAdmin) return res.status(403).json({ message: 'Access denied' });

    const fp = path.join(process.env.UPLOAD_DIR || 'uploads', doc.fileUrl);
    if (!fs.existsSync(fp)) return res.status(404).json({ message: 'File not found on disk' });

    res.setHeader('Content-Disposition', `attachment; filename="${doc.fileName}"`);
    res.setHeader('Content-Type', doc.mimeType || 'application/octet-stream');
    return res.sendFile(path.resolve(fp));
  } catch (e) {
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
