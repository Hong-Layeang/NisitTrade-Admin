import models from '../../models/index.js';
import { writeActivityLog } from '../../utils/activity-log.js';

const { Report, User, Product } = models;

const VALID_STATUSES = ['open', 'reviewing', 'closed'];

export default async function updateProductReportStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findByPk(id);
    if (!report || report.reportable_type !== 'Product') {
      return res.status(404).json({ message: 'Report not found' });
    }

    const previousStatus = report.status;
    await report.update({ status });

    const updatedReport = await Report.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        }
      ]
    });

    // Fetch the related product
    const product = await Product.findByPk(updatedReport.reportable_id, {
      attributes: ['id', 'title', 'price', 'status', 'user_id', 'category_id', 'created_at', 'updated_at']
    });

    if (req.user?.role === 'admin') {
      await writeActivityLog({
        actionType: 'admin_updated_something',
        message: `Admin updated report status: ${previousStatus} -> ${status}`,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        targetType: 'Report',
        targetId: Number(id),
        metadata: {
          reportableType: updatedReport.reportable_type,
          reportableId: updatedReport.reportable_id,
        },
      });
    }

    return res.json({
      ...updatedReport.toJSON(),
      Product: product
    });
  } catch (error) {
    console.error('Error updating report status:', error);
    return res.status(500).json({
      message: 'Failed to update report status',
      error: error.message
    });
  }
}
