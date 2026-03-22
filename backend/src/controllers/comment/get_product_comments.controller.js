import models from '../../models/index.js';

const { Comment, User } = models;

export default async function getProductCommentsController(req, res) {
  try {
    const { productId } = req.params;

    const comments = await Comment.findAll({
      where: { 
        commentable_type: 'Product',
        commentable_id: productId 
      },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({
      count: comments.length,
      comments: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      message: 'Failed to fetch comments',
      error: error.message
    });
  }
}
