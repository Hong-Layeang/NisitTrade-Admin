import models from '../../models/index.js';

const { HiddenItem } = models;

export default async function unhideCommunityPostForViewerController(req, res) {
  try {
    const { postId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    await HiddenItem.destroy({
      where: {
        user_id: userId,
        hideable_type: 'CommunityPost',
        hideable_id: Number(postId),
      },
    });

    return res.status(200).json({ success: true, hidden: false });
  } catch (err) {
    console.error('unhideCommunityPostForViewerController error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}