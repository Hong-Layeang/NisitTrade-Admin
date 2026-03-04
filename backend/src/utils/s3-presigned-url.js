import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import s3Client from '../config/aws.js';

const DEFAULT_EXPIRATION_SECONDS = 3600; // 1 hour

/**
 * Generate a pre-signed URL for accessing an S3 object
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
 * Extract S3 key from a full S3 URL
 * @param {string} s3Url - Full S3 URL
 * @returns {string} S3 key
 */
export function extractS3Key(s3Url) {
  try {
    const url = new URL(s3Url);
    // Remove leading slash from pathname
    return url.pathname.substring(1);
  } catch (error) {
    console.error('Error extracting S3 key from URL:', error);
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
