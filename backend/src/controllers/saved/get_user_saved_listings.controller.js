import models from '../../models/index.js';
import { Op } from 'sequelize';
import { enrichProductsWithPresignedUrls } from '../../utils/s3-presigned-url.js';

const { SavedListing, Product, User, Category, ProductImage } = models;

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

    const productWhere = requesterRole === 'admin'
      ? {}
      : { status: { [Op.ne]: 'hidden' } };

    const { count, rows } = await SavedListing.findAndCountAll({
      where: { user_id: id },
      include: [
        {
          model: Product,
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
          ]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Enrich each saved-listing's product with presigned S3 image URLs
    const enrichedRows = await Promise.all(
      rows.map(async (row) => {
        const rowJson = row.toJSON();
        if (!rowJson.Product) return rowJson;
        const [enrichedProduct] = await enrichProductsWithPresignedUrls([rowJson.Product]);
        return { ...rowJson, Product: enrichedProduct };
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
