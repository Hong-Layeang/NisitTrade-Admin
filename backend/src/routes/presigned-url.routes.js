import express from 'express';
import getPresignedUrlController from '../controllers/presigned-url/get_presigned_url.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * POST /api/presigned-url
 * Generate a fresh pre-signed URL for an image
 * Body: { s3Key: string, expirationSeconds?: number }
 */
router.post('/', authMiddleware, getPresignedUrlController);

export default router;
