import models from '../../models/index.js';
import { Op } from 'sequelize';
import { enrichProductsWithPresignedUrls } from '../../utils/s3-presigned-url.js';

const { Product, User, Category, ProductImage } = models;

export default async function getUserProductsController(req, res) {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Build filter: owner and admins see all their products;
    // other users only see non-hidden products.
    const where = { user_id: id };
    const isOwner = String(requesterId) === String(id);
    if (!isOwner && requesterRole !== 'admin') {
      where.status = { [Op.ne]: 'hidden' };
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
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
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Sort ProductImages by created_at ASC (same order as marketplace)
    rows.forEach(product => {
      if (product?.ProductImages) {
        product.ProductImages.sort((a, b) => {
          const aCreated = new Date(a.createdAt ?? a.created_at ?? 0);
          const bCreated = new Date(b.createdAt ?? b.created_at ?? 0);
          const diff = aCreated - bCreated;
          if (diff !== 0) return diff;
          return (a.id ?? 0) - (b.id ?? 0);
        });
      }
    });

    // Enrich all products with pre-signed URLs
    const enrichedProducts = await enrichProductsWithPresignedUrls(rows);

    res.json({
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      items: enrichedProducts
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({
      message: 'Failed to fetch user products',
      error: error.message
    });
  }
}
