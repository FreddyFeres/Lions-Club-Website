import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

// Ensure upload directories exist
const dirs = ['avatars', 'events', 'documents', 'meetings', 'receipts'];
dirs.forEach((dir) => {
  const fullPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    const url = req.path;
    if (url.includes('avatar')) folder = 'avatars';
    else if (url.includes('event')) folder = 'events';
    else if (url.includes('meeting')) folder = 'meetings';
    else if (url.includes('document')) folder = 'documents';
    else if (url.includes('finance') || url.includes('transaction')) folder = 'receipts';
    cb(null, path.join(UPLOAD_DIR, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.mimetype}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 20 * 1024 * 1024 },
});
