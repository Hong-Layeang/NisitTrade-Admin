import models from '../../models/index.js';

const { Report, User, Product } = models;

const VALID_STATUSES = ['open', 'reviewing', 'closed'];

export default async function listProductReportsController(req, res) {
  try {
    const { status, limit = 50, offset = 0, product_id } = req.query;

    const where = { reportable_type: 'Product' };
    if (status) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({ message: 'Invalid status filter' });
      }
      where.status = status;
    }

    if (product_id) {
      where.reportable_id = product_id;
    }

    const { count, rows } = await Report.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Batch fetch products for these reports
    const productIds = [...new Set(rows.map(r => r.reportable_id))];
    const products = await Product.findAll({
      where: { id: productIds },
      attributes: ['id', 'title', 'price', 'status', 'user_id', 'category_id', 'created_at', 'updated_at']
    });

    const productMap = new Map(products.map(p => [p.id, p]));
    const items = rows.map(row => ({
      ...row.toJSON(),
      Product: productMap.get(row.reportable_id)
    }));

    return res.json({
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      items
    });
  } catch (error) {
    console.error('Error listing reports:', error);
    return res.status(500).json({
      message: 'Failed to list reports',
      error: error.message
    });
  }
}
