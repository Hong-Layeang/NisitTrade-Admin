import models from '../../models/index.js';

const { UserFollow } = models;

export default async function unfollowUserController(req, res) {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.id, 10);

    if (!followerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const deleted = await UserFollow.destroy({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'Not following this user' });
    }

    res.json({ message: 'Unfollowed successfully', following: false });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Failed to unfollow user', error: error.message });
  }
}
