import { generatePresignedUrl } from '../../utils/s3-presigned-url.js';

/**
 * Generate a fresh pre-signed URL for an image
 * Used when the client's URL has expired
 * 
 * POST /api/presigned-url
 * Body: { s3Key: string, expirationSeconds?: number }
 * 
 * Example:
 * POST /api/presigned-url
 * { "s3Key": "nisittrade/products/1234567890-abc123-image.jpg" }
 */
export default async function getPresignedUrlController(req, res) {
  try {
    const { s3Key, expirationSeconds } = req.body;

    if (!s3Key) {
      return res.status(400).json({
        message: 'Missing required field: s3Key'
      });
    }

    // Validate S3 key format (should contain nisittrade/ prefix)
    if (!s3Key.startsWith('nisittrade/')) {
      return res.status(400).json({
        message: 'Invalid S3 key: must be a valid nisittrade resource'
      });
    }

    const expirationTime = expirationSeconds || 3600; // Default 1 hour

    // Validate expiration time is reasonable (max 7 days)
    if (expirationTime > 604800) {
      return res.status(400).json({
        message: 'Expiration time too long (max 7 days)'
      });
    }

    const presignedUrl = await generatePresignedUrl(s3Key, expirationTime);

    res.json({
      s3Key,
      presignedUrl,
      expiresIn: expirationTime
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({
      message: 'Failed to generate pre-signed URL',
      error: error.message
    });
  }
}
