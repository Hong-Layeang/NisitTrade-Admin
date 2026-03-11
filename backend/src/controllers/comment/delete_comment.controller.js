import models from '../../models/index.js';

const { Comment } = models;

export default async function deleteCommentController(req, res) {
  try {
    const { productId, commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
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
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment
    await comment.destroy();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      message: 'Failed to delete comment',
      error: error.message
    });
  }
}
