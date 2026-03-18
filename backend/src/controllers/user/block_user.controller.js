import models from '../../models/index.js';

const { UserBlock } = models;

export default async function blockUserController(req, res) {
  try {
    const blockerId = req.user?.id;
    const blockedId = parseInt(req.params.id, 10);

    if (!blockerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (blockerId === blockedId) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    const [, created] = await UserBlock.findOrCreate({
      where: { blocker_id: blockerId, blocked_id: blockedId },
    });

    if (!created) {
      return res.status(409).json({ message: 'User already blocked' });
    }

    res.status(201).json({ message: 'User blocked', blocked: true });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Failed to block user', error: error.message });
  }
}
