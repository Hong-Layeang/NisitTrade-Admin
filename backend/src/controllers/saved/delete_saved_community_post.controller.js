import models from '../../models/index.js';

const { SavedItem } = models;

export default async function deleteSavedCommunityPostController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const deleted = await SavedItem.destroy({
      where: { user_id: userId, saveable_type: 'CommunityPost', saveable_id: postId },
    });

    if (!deleted) {
      return res.status(200).json({ message: 'Post already unsaved' });
    }

    return res.status(200).json({ message: 'Post unsaved' });
  } catch (error) {
    console.error('Error unsaving community post:', error);
    return res.status(500).json({
      message: 'Failed to unsave post',
      error: error.message,
    });
  }
}
