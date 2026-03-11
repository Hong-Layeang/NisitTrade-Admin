import models from '../../models/index.js';

const { Comment, User } = models;

export default async function updateCommentController(req, res) {
  try {
    const { productId, commentId } = req.params;
    const { content, rating } = req.body;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    // Find the comment
    const comment = await Comment.findByPk(commentId);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Verify the comment belongs to the specified product
    if (comment.product_id !== parseInt(productId, 10)) {
      return res.status(400).json({ message: 'Comment does not belong to this product' });
    }

    // Check if user is the owner of the comment
    if (comment.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    // Validate rating if provided
    if (rating !== undefined && rating !== null) {
      if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
    }

    // Update the comment
    await comment.update({
      content: content.trim(),
      rating: rating !== undefined ? rating : comment.rating
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

    res.json(comment);
  } catch (error) {
    console.error('Error updating comment:', error);
    res.status(500).json({
      message: 'Failed to update comment',
      error: error.message
    });
  }
}
