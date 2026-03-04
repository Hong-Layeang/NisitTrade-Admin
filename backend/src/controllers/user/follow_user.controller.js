import models from '../../models/index.js';

const { UserFollow } = models;

export default async function followUserController(req, res) {
  try {
    const followerId = req.user?.id;
    const followingId = parseInt(req.params.id, 10);

    if (!followerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (followerId === followingId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const [, created] = await UserFollow.findOrCreate({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (!created) {
      return res.status(409).json({ message: 'Already following this user' });
    }

    res.status(201).json({ message: 'Followed successfully', following: true });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Failed to follow user', error: error.message });
  }
}
