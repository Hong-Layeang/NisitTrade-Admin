import models from '../../models/index.js';

const { Comment, Product, User } = models;

export default async function createCommentController(req, res) {
  try {
    const { productId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
    }

    // Create the comment
    const comment = await Comment.create({
      user_id: userId,
      product_id: productId,
      content,
      rating: rating || null
    });

    // Include user info
    await comment.reload({
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
        }
      ]
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({
      message: 'Failed to create comment',
      error: error.message
    });
  }
}
