import models from '../../models/index.js';

const { Like, User } = models;

export default async function getProductLikesController(req, res) {
  try {
    const { productId } = req.params;

    const likes = await Like.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      count: likes.length,
      likes: likes
    });
  } catch (error) {
    console.error('Error fetching likes:', error);
    res.status(500).json({
      message: 'Failed to fetch likes',
      error: error.message
    });
  }
}
