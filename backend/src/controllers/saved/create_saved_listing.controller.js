import models from '../../models/index.js';

const { SavedListing, Product } = models;

export default async function createSavedListingController(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const [saved, created] = await SavedListing.findOrCreate({
      where: { user_id: userId, product_id: productId },
      defaults: { user_id: userId, product_id: productId }
    });

    return res.status(created ? 201 : 200).json(saved);
  } catch (error) {
    console.error('Error saving listing:', error);
    return res.status(500).json({
      message: 'Failed to save listing',
      error: error.message
    });
  }
}
