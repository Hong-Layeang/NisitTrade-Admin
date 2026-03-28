import express from 'express';
import getPresignedUrlController from '../controllers/presigned-url/get_presigned_url.controller.js';
import getPresignedUploadUrlController from '../controllers/presigned-url/get_presigned_upload_url.controller.js';
import uploadProductImageController from '../controllers/presigned-url/upload_product_image.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadProductImage } from '../middlewares/upload.middleware.js';

const router = express.Router();

/**
 * POST /api/presigned-url
 * Generate a fresh pre-signed URL for an image
 * Body: { s3Key: string, expirationSeconds?: number }
 */
router.post('/', authMiddleware, getPresignedUrlController);

/**
 * POST /api/presigned-url/upload
 * Generate a presigned PUT URL for uploading a product image to S3
 * Body: { filename: string, contentType?: string, expirationSeconds?: number }
 */
router.post('/upload', authMiddleware, getPresignedUploadUrlController);

/**
 * POST /api/presigned-url/upload-image
 * Upload a product image directly through backend to S3
 * Body: form-data with 'image' field (single file)
 */
router.post('/upload-image', authMiddleware, uploadProductImage, uploadProductImageController);

export default router;
