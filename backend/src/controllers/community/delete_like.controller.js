import models from '../../models/index.js';

const { CommunityPost, CommunityPostLike } = models;

export default async function deleteCommunityLikeController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const like = await CommunityPostLike.findOne({
      where: {
        community_post_id: post.id,
        user_id: userId,
      },
    });

    if (!like) {
      return res.status(200).json({ message: 'Unliked' });
    }

    await like.destroy();

    await CommunityPost.update(
      {
        likes_count: CommunityPost.sequelize.literal('GREATEST(likes_count - 1, 0)'),
      },
      { where: { id: post.id } },
    );

    return res.status(200).json({ message: 'Like removed' });
  } catch (err) {
    console.error('deleteCommunityLikeController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}