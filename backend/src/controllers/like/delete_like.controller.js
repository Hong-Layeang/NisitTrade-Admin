import models from '../../models/index.js';

const { Like } = models;

export default async function deleteLikeController(req, res) {
  try {
    const { productId, likeId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Find the like
    const like = await Like.findByPk(likeId);

    if (!like) {
      // Return 200 OK even if like not found - it's already deleted
      return res.json({ message: 'Unliked' });
    }

    // Verify the like belongs to the specified product
    if (like.likeable_type !== 'Product' || Number(like.likeable_id) !== Number(productId)) {
      return res.status(400).json({ message: 'Like does not belong to this product' });
    }

    // Check if user is the owner of the like
    if (Number(like.user_id) !== Number(userId) && userRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Delete the like
    await like.destroy();

    res.json({ message: 'Like deleted successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to unlike',
      error: error.message
    });
  }
}
