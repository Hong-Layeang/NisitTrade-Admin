import models from '../../models/index.js';

const { CommunityPost, Like } = models;

export default async function createCommunityLikeController(req, res) {
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

    const [like, created] = await Like.findOrCreate({
      where: {
        likeable_type: 'CommunityPost',
        likeable_id: post.id,
        user_id: userId,
      },
      defaults: {
        likeable_type: 'CommunityPost',
        likeable_id: post.id,
        user_id: userId,
      },
    });

    if (created) {
      await post.increment('likes_count', { by: 1 });
      return res.status(201).json(like);
    }

    return res.status(200).json(like);
  } catch (err) {
    console.error('createCommunityLikeController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}