import models from '../../models/index.js';

const { Conversation, ConversationParticipant } = models;

export default async function deleteConversationController(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId },
    });

    if (!participant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await participant.destroy();

    const remainingParticipants = await ConversationParticipant.count({
      where: { conversation_id: id },
    });

    if (remainingParticipants === 0) {
      await Conversation.destroy({
        where: { id },
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({
      message: 'Failed to delete conversation',
      error: error.message,
    });
  }
}
