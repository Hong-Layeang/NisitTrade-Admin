import models from '../../models/index.js';
import { enrichProductWithPresignedUrls } from '../../utils/s3-presigned-url.js';

const { Product, User, Category, ProductImage, Like, Comment, University } = models;

export default async function getProductController(req, res) {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (requesterId) {
      const hiddenForViewer = await models.HiddenItem.findOne({
        where: {
          user_id: requesterId,
          hideable_type: 'Product',
          hideable_id: Number(id),
        },
      });

      if (hiddenForViewer && requesterRole !== 'admin') {
        return res.status(404).json({ message: 'Product not found' });
      }
    }

    const product = await Product.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'created_at', 'updated_at']
        },
        {
          model: ProductImage,
          attributes: ['id', 'image_url', 'product_id', 'created_at', 'updated_at']
        },
        {
          model: Like,
          as: 'Likes',
          attributes: ['id', 'user_id', 'likeable_id', 'likeable_type', 'created_at', 'updated_at'],
          where: {
            likeable_type: 'Product'
          },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'full_name', 'profile_image']
            }
          ]
        },
        {
          model: Comment,
          as: 'Comments',
          attributes: ['id', 'content', 'rating', 'user_id', 'commentable_id', 'commentable_type', 'created_at', 'updated_at'],
          where: {
            commentable_type: 'Product'
          },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id'],
              include: [
                {
                  model: University,
                  attributes: ['id', 'name', 'domain']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    if (product?.ProductImages) {
      product.ProductImages.sort((a, b) => {
        const aCreated = new Date(a.createdAt ?? a.created_at ?? 0);
        const bCreated = new Date(b.createdAt ?? b.created_at ?? 0);
        const createdDiff = aCreated - bCreated;
        if (createdDiff !== 0) return createdDiff;
        return (a.id ?? 0) - (b.id ?? 0);
      });
    }

    // Sort comments by created_at in descending order (newest first)
    if (product?.Comments) {
      product.Comments.sort((a, b) => {
        const aCreated = new Date(a.createdAt ?? a.created_at ?? 0);
        const bCreated = new Date(b.createdAt ?? b.created_at ?? 0);
        const createdDiff = bCreated - aCreated;
        if (createdDiff !== 0) return createdDiff;
        return (b.id ?? 0) - (a.id ?? 0); // Newer IDs first if same time
      });
    }

    if (product.status === 'hidden' && String(product.user_id) !== String(requesterId) && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Enrich with pre-signed URLs
    const enrichedProduct = await enrichProductWithPresignedUrls(product);

    res.json(enrichedProduct);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ 
      message: 'Failed to fetch product',
      error: error.message 
    });
  }
}

