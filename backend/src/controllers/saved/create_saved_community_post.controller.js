import models from '../../models/index.js';

const { CommunityPost, SavedItem } = models;

export default async function createSavedCommunityPostController(req, res) {
  try {
    const postId = parseInt(req.params.postId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if post exists
    const post = await CommunityPost.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: 'Community post not found' });
    }

    // Create or find saved item
    const [saved, created] = await SavedItem.findOrCreate({
      where: {
        saveable_type: 'CommunityPost',
        saveable_id: postId,
        user_id: userId,
      },
      defaults: {
        saveable_type: 'CommunityPost',
        saveable_id: postId,
        user_id: userId,
      },
    });

    res.status(200).json(saved);
  } catch (error) {
    console.error('Error saving community post:', error);
    res.status(400).json({ error: error.message });
  }
}
