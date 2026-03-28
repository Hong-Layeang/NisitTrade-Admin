import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/aws.js';
import crypto from 'crypto';

const DEFAULT_EXPIRATION_SECONDS = 3600; // 1 hour

/**
 * Generate a pre-signed URL for accessing an S3 object (GET)
 * @param {string} s3Key - The S3 object key (path)
 * @param {number} expirationSeconds - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
export async function generatePresignedUrl(
  s3Key,
  expirationSeconds = DEFAULT_EXPIRATION_SECONDS
) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error(`Failed to generate pre-signed URL for ${s3Key}`);
  }
}

/**
 * Generate a pre-signed URL for uploading an object to S3 (PUT)
 * @param {string} s3Key - The S3 object key (path)
 * @param {string} contentType - The MIME type of the file being uploaded (e.g., 'image/jpeg')
 * @param {number} expirationSeconds - URL expiration time in seconds (default: 1 hour)
 * @returns {Promise<string>} Pre-signed PUT URL
 */
export async function generatePresignedPutUrl(
  s3Key,
  contentType = 'application/octet-stream',
  expirationSeconds = DEFAULT_EXPIRATION_SECONDS
) {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: expirationSeconds,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Error generating presigned PUT URL:', error);
    throw new Error(`Failed to generate presigned PUT URL for ${s3Key}`);
  }
}

/**
 * Generate a unique S3 key for a product image
 * @param {string} filename - Original filename
 * @returns {string} Unique S3 key path
 */
export function generateProductImageKey(filename) {
  const timestamp = Date.now();
  const randomId = crypto.randomBytes(8).toString('hex');
  const ext = filename.substring(filename.lastIndexOf('.')) || '.jpg';
  return `nisittrade/products/${timestamp}-${randomId}${ext}`;
}

/**
 * Upload a product image to S3 directly
 * @param {Buffer} fileBuffer - File buffer from multer
 * @param {string} filename - Original filename
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} S3 key of the uploaded image
 */
export async function uploadProductImageToS3(fileBuffer, filename, contentType = 'application/octet-stream') {
  try {
    const s3Key = generateProductImageKey(filename);

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);
    return s3Key;
  } catch (error) {
    console.error('Error uploading product image to S3:', error);
    throw new Error(`Failed to upload image to S3: ${error.message}`);
  }
}

/**
 * Generate pre-signed URLs for product images
 * @param {Object} product - Product object with ProductImages array
 * @param {number} expirationSeconds - URL expiration time in seconds
 * @returns {Promise<Object>} Product with pre-signed URLs
 */
export async function enrichProductWithPresignedUrls(
  product,
  expirationSeconds = DEFAULT_EXPIRATION_SECONDS
) {
  if (!product?.ProductImages || product.ProductImages.length === 0) {
    return product;
  }

  try {
    const enrichedImages = await Promise.all(
      product.ProductImages.map(async (img) => {
        const s3Key = img.image_url; // S3 key stored in image_url field
        try {
          const presignedUrl = await generatePresignedUrl(s3Key, expirationSeconds);
          return {
            ...img.toJSON?.() || img,
            image_url: presignedUrl,
          };
        } catch (error) {
          console.error(`Failed to generate pre-signed URL for ${s3Key}:`, error);
          return img.toJSON?.() || img;
        }
      })
    );

    return {
      ...product.toJSON?.() || product,
      ProductImages: enrichedImages,
    };
  } catch (error) {
    console.error('Error enriching product with pre-signed URLs:', error);
    return product;
  }
}

/**
 * Generate pre-signed URLs for multiple products
 * @param {Array} products - Array of product objects
 * @param {number} expirationSeconds - URL expiration time in seconds
 * @returns {Promise<Array>} Products with pre-signed URLs
 */
export async function enrichProductsWithPresignedUrls(
  products,
  expirationSeconds = DEFAULT_EXPIRATION_SECONDS
) {
  if (!Array.isArray(products)) {
    return products;
  }

  try {
    return await Promise.all(
      products.map(product =>
        enrichProductWithPresignedUrls(product, expirationSeconds)
      )
    );
  } catch (error) {
    console.error('Error enriching products with pre-signed URLs:', error);
    return products;
  }
}

/**
 * Extract S3 key from a full S3 URL or return the key as-is if it's already a bare key
 * @param {string} s3Url - Full S3 URL or bare S3 key
 * @returns {string} S3 key
 */
export function extractS3Key(s3Url) {
  if (!s3Url) return null;
  try {
    const url = new URL(s3Url);
    // Remove leading slash from pathname
    return url.pathname.substring(1);
  } catch (error) {
    // If it's not a valid URL, assume it's already a bare S3 key
    if (typeof s3Url === 'string' && s3Url.length > 0) {
      return s3Url;
    }
    return null;
  }
}

/**
 * Generate a pre-signed URL from a full S3 URL.
 * Returns the original URL unchanged if it is null/empty or not an S3 URL.
 * @param {string|null} url - Full S3 URL or any plain URL
 * @param {number} expirationSeconds
 * @returns {Promise<string|null>}
 */
export async function presignIfS3Url(url, expirationSeconds = DEFAULT_EXPIRATION_SECONDS) {
  if (!url) return url;
  try {
    const s3Key = extractS3Key(url);
    if (!s3Key) return url;
    return await generatePresignedUrl(s3Key, expirationSeconds);
  } catch {
    return url;
  }
}

export default generatePresignedUrl;
