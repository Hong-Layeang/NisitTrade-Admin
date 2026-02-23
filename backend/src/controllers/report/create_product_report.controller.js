import models from '../../models/index.js';

const { ProductReport, Product } = models;

export default async function createProductReportController(req, res) {
  try {
    const { productId } = req.params;
    const { reason, details } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Reason is required' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const report = await ProductReport.create({
      user_id: userId,
      product_id: productId,
      reason: reason.trim(),
      details: details?.trim() || null
    });

    return res.status(201).json(report);
  } catch (error) {
    console.error('Error reporting product:', error);
    return res.status(500).json({
      message: 'Failed to report product',
      error: error.message
    });
  }
}
