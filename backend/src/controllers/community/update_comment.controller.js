import models from '../../models/index.js';

const { CommunityPost, Comment } = models;

export default async function updateCommunityCommentController(req, res) {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const content = req.body?.content?.trim() ?? '';
    const { rating } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    if (content.length > 500) {
      return res.status(400).json({ message: 'Comment must be 500 characters or less' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment || comment.commentable_type !== 'CommunityPost' || Number(comment.commentable_id) !== Number(post.id)) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (Number(comment.user_id) !== Number(userId) && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    const updateData = { content };
    if (rating !== undefined) {
      if (rating !== null && (rating < 1 || rating > 5)) {
        return res.status(400).json({ message: 'Rating must be between 1 and 5' });
      }
      updateData.rating = rating;
    }

    await comment.update(updateData);
    return res.status(200).json(comment);
  } catch (err) {
    console.error('updateCommunityCommentController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}