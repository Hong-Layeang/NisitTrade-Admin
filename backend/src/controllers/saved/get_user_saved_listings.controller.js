import models from '../../models/index.js';
import { Op } from 'sequelize';
import { enrichProductsWithPresignedUrls } from '../../utils/s3-presigned-url.js';

const { SavedItem, Product, User, Category, ProductImage } = models;

export default async function getUserSavedListingsController(req, res) {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (String(requesterId) !== String(id) && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Get all saved items for this user that are products
    const { count, rows } = await SavedItem.findAndCountAll({
      where: { user_id: id, saveable_type: 'Product' },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
      raw: true,
    });

    // Batch fetch all products
    const productIds = rows.map(row => row.saveable_id);
    const productWhere = requesterRole === 'admin'
      ? { id: { [Op.in]: productIds } }
      : { id: { [Op.in]: productIds }, status: { [Op.ne]: 'hidden' } };

    const products = await Product.findAll({
      where: productWhere,
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
    });

    // Create a map of productId -> product for easy lookup
    const productMap = new Map(products.map(p => [p.id, p]));

    // Combine saved items with products, maintaining order
    const enrichedRows = await Promise.all(
      rows
        .map(row => productMap.get(row.saveable_id))
        .filter(product => product !== undefined)
        .map(async (product) => {
          const productJson = product.toJSON();
          const [enrichedProduct] = await enrichProductsWithPresignedUrls([productJson]);
          return enrichedProduct;
        })
    );

    return res.json({
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      items: enrichedRows
    });
  } catch (error) {
    console.error('Error fetching saved listings:', error);
    return res.status(500).json({
      message: 'Failed to fetch saved listings',
      error: error.message
    });
  }
}
