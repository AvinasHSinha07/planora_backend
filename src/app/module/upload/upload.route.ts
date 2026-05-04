import express from 'express';
import { UploadController } from './upload.controller';
import { upload } from '../../utils/cloudinary';
import requireAuth from '../../middleware/auth';
import { Role } from '@prisma/client';

const router = express.Router();

/**
 * POST /api/v1/upload/image
 * Protected - any authenticated user can upload an image.
 * Field name in the form-data must be "file".
 */
router.post(
    '/image',
    requireAuth(Role.USER, Role.ORGANIZER, Role.ADMIN),
    upload.single('file'),
    UploadController.uploadImage,
);

export const UploadRoutes = router;
