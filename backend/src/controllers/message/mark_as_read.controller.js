import models from '../../models/index.js';

const { Message, MessageRead, ConversationParticipant } = models;

export default async function markAsReadController(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: message.conversation_id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const [readReceipt] = await MessageRead.findOrCreate({
      where: { message_id: id, user_id: userId },
      defaults: { read_at: new Date() }
    });

    res.json(readReceipt);
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      message: 'Failed to mark message as read',
      error: error.message
    });
  }
}
