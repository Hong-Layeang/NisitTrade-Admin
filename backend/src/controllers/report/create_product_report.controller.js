import models from '../../models/index.js';

const { Product, Report } = models;

export default async function createProductReportController(req, res) {
  try {
    const productId = parseInt(req.params.productId, 10);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate request body
    if (!req.body?.reason || !req.body.reason.trim()) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    const reason = req.body.reason.trim();
    const details = req.body.details?.trim() || null;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const report = await Report.create({
      reportable_type: 'Product',
      reportable_id: productId,
      user_id: userId,
      reason,
      details,
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Error creating report:', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
}
