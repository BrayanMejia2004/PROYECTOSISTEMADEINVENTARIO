import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, PNG, WebP, AVIF)'));
    }
  },
}).single('image');

export const uploadImage = (req: Request, res: Response, next: NextFunction) => {
  upload(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: `Error al subir archivo: ${error.message}` });
    }
    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next();
  });
};
