import models from '../../models/index.js';

const { CommunityPost, CommunityPostComment } = models;

export default async function deleteCommunityCommentController(req, res) {
  try {
    const { postId, commentId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const comment = await CommunityPostComment.findByPk(commentId);
    if (!comment || Number(comment.community_post_id) !== Number(post.id)) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (Number(comment.user_id) !== Number(userId) && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.destroy();

    await CommunityPost.update(
      {
        comments_count: CommunityPost.sequelize.literal('GREATEST(comments_count - 1, 0)'),
      },
      { where: { id: post.id } },
    );

    return res.status(200).json({ message: 'Comment deleted' });
  } catch (err) {
    console.error('deleteCommunityCommentController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}