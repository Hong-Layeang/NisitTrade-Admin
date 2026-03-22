import models from '../../models/index.js';

const { UserBlock } = models;

export default async function unblockUserController(req, res) {
  try {
    const blockerId = req.user?.id;
    const blockedId = parseInt(req.params.id, 10);

    if (!blockerId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Number.isInteger(blockedId) || blockedId <= 0) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    await UserBlock.destroy({
      where: { blocker_id: blockerId, blocked_id: blockedId },
    });

    res.json({ message: 'User unblocked', blocked: false });
  } catch (error) {
    console.error('Error unblocking user:', error);
    res.status(500).json({ message: 'Failed to unblock user', error: error.message });
  }
}
