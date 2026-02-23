import models from '../../models/index.js';

const { SavedListing } = models;

export default async function deleteSavedListingController(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    await SavedListing.destroy({
      where: { user_id: userId, product_id: productId }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error removing saved listing:', error);
    return res.status(500).json({
      message: 'Failed to remove saved listing',
      error: error.message
    });
  }
}
