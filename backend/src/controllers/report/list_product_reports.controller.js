import models from '../../models/index.js';

const { ProductReport, User, Product } = models;

const VALID_STATUSES = ['open', 'reviewing', 'closed'];

export default async function listProductReportsController(req, res) {
  try {
    const { status, limit = 50, offset = 0, product_id } = req.query;

    const where = {};
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      where.status = status;
    }

    if (product_id) {
      where.product_id = product_id;
    }

    const { count, rows } = await ProductReport.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        },
        {
          model: Product,
          attributes: ['id', 'title', 'price', 'status', 'user_id', 'category_id', 'created_at', 'updated_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      items: rows
    });
  } catch (error) {
    console.error('Error listing reports:', error);
    return res.status(500).json({
      message: 'Failed to list reports',
      error: error.message
    });
  }
}
