import models from '../../models/index.js';

const { Comment, User } = models;

export default async function updateCommentController(req, res) {
  try {
    const { productId, commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    //Verify comment belongs to the product
    if (comment.commentable_type !== 'Product' || comment.commentable_id !== parseInt(productId, 10)) {
      return res.status(400).json({ error: 'Comment does not belong to this product' });
    }

    // Check authorization
    if (comment.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {};

    if (req.body?.content) {
      const content = req.body.content.trim();
      if (!content) {
        return res.status(400).json({ error: 'Content cannot be empty' });
      }
      if (content.length > 500) {
        return res.status(400).json({ error: 'Comment must be 500 characters or less' });
      }
      updateData.content = content;
    }

    if (req.body?.rating !== undefined) {
      const rating = req.body.rating ? parseInt(req.body.rating, 10) : null;
      if (rating !== null && (rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
      }
      updateData.rating = rating;
    }

    await comment.update(updateData);

    const updatedComment = await Comment.findByPk(commentId, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
        }
      ]
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    
    // Handle specific database constraint errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Invalid data provided' });
    }
    
    const status = error.message?.includes('Access denied') ? 403 :
                   error.message?.includes('not found') ? 404 : 500;
    res.status(status).json({ error: 'Failed to update comment. Please try again.' });
  }
}
