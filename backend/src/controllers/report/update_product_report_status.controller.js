import models from '../../models/index.js';

const { ProductReport, User, Product } = models;

const VALID_STATUSES = ['open', 'reviewing', 'closed'];

export default async function updateProductReportStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await ProductReport.findByPk(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await report.update({ status });

    const updatedReport = await ProductReport.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        },
        {
          model: Product,
          attributes: ['id', 'title', 'price', 'status', 'user_id', 'category_id', 'created_at', 'updated_at']
        }
      ]
    });

    return res.json(updatedReport);
  } catch (error) {
    console.error('Error updating report status:', error);
    return res.status(500).json({
      message: 'Failed to update report status',
      error: error.message
    });
  }
}
