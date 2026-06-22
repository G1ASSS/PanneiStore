import multer from 'multer';
import path from 'path';
import { config } from '../config';
import { ApiError } from '../utils/response.utils';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

const storage = multer.memoryStorage();

const imageFileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed (JPEG, PNG, WebP, GIF)') as any);
  }
};

export const uploadSingle = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeMB * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).single('image');

export const uploadMultiple = multer({
  storage,
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
    files: config.upload.maxFiles,
  },
  fileFilter: imageFileFilter,
}).array('images', config.upload.maxFiles);

export const uploadFields = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSizeMB * 1024 * 1024 },
  fileFilter: imageFileFilter,
}).fields([
  { name: 'images', maxCount: 10 },
  { name: 'paymentProof', maxCount: 1 },
]);
