import models from '../../models/index.js';

const { CommunityPost, HiddenItem } = models;

export default async function hideCommunityPostForViewerController(req, res) {
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

    if (post.user_id === userId) {
      return res.status(400).json({ message: 'You cannot hide your own post from feed' });
    }

    await HiddenItem.findOrCreate({
      where: {
        user_id: userId,
        hideable_type: 'CommunityPost',
        hideable_id: Number(postId),
      },
      defaults: {
        user_id: userId,
        hideable_type: 'CommunityPost',
        hideable_id: Number(postId),
      },
    });

    return res.status(200).json({ success: true, hidden: true });
  } catch (err) {
    console.error('hideCommunityPostForViewerController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}