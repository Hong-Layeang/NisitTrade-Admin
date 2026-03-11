import models from '../../models/index.js';

const { CommunityPost } = models;

export default async function deleteCommunityPostController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Community post not found' });
    }

    const isOwner = Number(post.user_id) === Number(userId);
    if (!isOwner && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.destroy();
    return res.status(200).json({ message: 'Post deleted' });
  } catch (err) {
    console.error('deleteCommunityPostController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
