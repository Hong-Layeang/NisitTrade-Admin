import models from '../../models/index.js';

const { Product, HiddenItem } = models;

export default async function hideProductForViewerController(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.user_id === userId) {
      return res.status(400).json({ message: 'You cannot hide your own product from feed' });
    }

    await HiddenItem.findOrCreate({
      where: {
        user_id: userId,
        hideable_type: 'Product',
        hideable_id: Number(id),
      },
      defaults: {
        user_id: userId,
        hideable_type: 'Product',
        hideable_id: Number(id),
      },
    });

    return res.status(200).json({ success: true, hidden: true });
  } catch (error) {
    console.error('Error hiding product for viewer:', error);
    return res.status(500).json({
      message: 'Failed to hide product for viewer',
      error: error.message,
    });
  }
}