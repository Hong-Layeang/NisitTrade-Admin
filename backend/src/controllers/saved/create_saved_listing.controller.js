import models from '../../models/index.js';

const { Product, SavedItem } = models;

export default async function createSavedListingController(req, res) {
  try {
    const productId = parseInt(req.params.productId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Create or find saved item
    const [saved, created] = await SavedItem.findOrCreate({
      where: {
        saveable_type: 'Product',
        saveable_id: productId,
        user_id: userId,
      },
      defaults: {
        saveable_type: 'Product',
        saveable_id: productId,
        user_id: userId,
      },
    });

    res.status(200).json(saved);
  } catch (error) {
    console.error('Error saving product:', error);
    res.status(400).json({ error: error.message });
  }
}
