import models from '../../models/index.js';

const { SavedCommunityPost, CommunityPost } = models;

export default async function createSavedCommunityPostController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const [saved, created] = await SavedCommunityPost.findOrCreate({
      where: { user_id: userId, community_post_id: postId },
      defaults: { user_id: userId, community_post_id: postId },
    });

    return res.status(created ? 201 : 200).json(saved);
  } catch (error) {
    console.error('Error saving community post:', error);
    return res.status(500).json({
      message: 'Failed to save post',
      error: error.message,
    });
  }
}
