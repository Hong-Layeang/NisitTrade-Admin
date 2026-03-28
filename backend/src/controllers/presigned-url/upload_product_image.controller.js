import { uploadProductImageToS3 } from '../../utils/s3-presigned-url.js';

/**
 * Upload a product image to S3
 * 
 * POST /api/presigned-url/upload-image
 * Body: multipart form data with 'image' field
 * 
 * Response:
 * {
 *   "s3Key": "nisittrade/products/1234567890-abc123-image.jpg",
 *   "message": "Image uploaded successfully"
 * }
 */
export default async function uploadProductImageController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: 'No image file provided'
      });
    }

    // Upload to S3
    const s3Key = await uploadProductImageToS3(req.file.buffer, req.file.originalname, req.file.mimetype);

    res.json({
      s3Key,
      message: 'Image uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({
      message: 'Failed to upload image',
      error: error.message
    });
  }
}
