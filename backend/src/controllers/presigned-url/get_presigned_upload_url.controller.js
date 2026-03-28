import { generatePresignedPutUrl, generateProductImageKey } from '../../utils/s3-presigned-url.js';

/**
 * Generate a presigned PUT URL for uploading a product image to S3
 * 
 * POST /api/presigned-url/upload
 * Body: { filename: string, contentType?: string, expirationSeconds?: number }
 * 
 * Example:
 * POST /api/presigned-url/upload
 * { 
 *   "filename": "product-image.jpg",
 *   "contentType": "image/jpeg"
 * }
 * 
 * Response:
 * {
 *   "s3Key": "nisittrade/products/1234567890-abc123-image.jpg",
 *   "presignedUrl": "https://bucket.s3.amazonaws.com/...",
 *   "expiresIn": 3600
 * }
 */
export default async function getPresignedUploadUrlController(req, res) {
  try {
    const { filename, contentType = 'application/octet-stream', expirationSeconds } = req.body;

    if (!filename) {
      return res.status(400).json({
        message: 'Missing required field: filename'
      });
    }

    const expirationTime = expirationSeconds || 3600; // Default 1 hour

    // Validate expiration time is reasonable (max 7 days)
    if (expirationTime > 604800) {
      return res.status(400).json({
        message: 'Expiration time too long (max 7 days)'
      });
    }

    // Generate unique S3 key
    const s3Key = generateProductImageKey(filename);

    // Generate presigned PUT URL
    const presignedUrl = await generatePresignedPutUrl(s3Key, contentType, expirationTime);

    res.json({
      s3Key,
      presignedUrl,
      expiresIn: expirationTime
    });
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    res.status(500).json({
      message: 'Failed to generate presigned upload URL',
      error: error.message
    });
  }
}
