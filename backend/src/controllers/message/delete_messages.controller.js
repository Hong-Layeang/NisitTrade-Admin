import { Op } from 'sequelize';
import models from '../../models/index.js';
import { broadcastMessageDelete } from '../../utils/websockets/chat.socket.js';

const { Message, ConversationParticipant, MessageRead } = models;

export default async function deleteMessagesController(req, res) {
  try {
    const userId = req.user?.id;
    const { message_ids } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Array.isArray(message_ids) || message_ids.length === 0) {
      return res.status(400).json({ message: 'message_ids array is required' });
    }

    const ids = message_ids
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id > 0);

    if (ids.length === 0) {
      return res.status(400).json({ message: 'No valid message IDs provided' });
    }

    // Fetch messages and verify ownership
    const messages = await Message.findAll({
      where: { id: { [Op.in]: ids } },
      attributes: ['id', 'sender_id', 'conversation_id'],
    });

    if (messages.length === 0) {
      return res.status(404).json({ message: 'No messages found' });
    }

    // All must belong to the same sender (the requesting user)
    const notOwned = messages.filter((m) => m.sender_id !== userId);
    if (notOwned.length > 0) {
      return res.status(403).json({ message: 'You can only delete your own messages' });
    }

    // Verify user is a participant in each conversation
    const conversationIds = [...new Set(messages.map((m) => m.conversation_id))];
    for (const cid of conversationIds) {
      const participant = await ConversationParticipant.findOne({
        where: { conversation_id: cid, user_id: userId },
      });
      if (!participant) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const deletedIds = messages.map((m) => m.id);

    // Delete read receipts first, then messages
    await MessageRead.destroy({ where: { message_id: { [Op.in]: deletedIds } } });
    await Message.destroy({ where: { id: { [Op.in]: deletedIds } } });

    res.json({ deleted: deletedIds });

    // Broadcast to each affected conversation
    const io = req.app.get('io');
    for (const cid of conversationIds) {
      const idsForConv = messages
        .filter((m) => m.conversation_id === cid)
        .map((m) => m.id);
      broadcastMessageDelete(io, cid, idsForConv);
    }
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ message: 'Failed to delete messages', error: error.message });
  }
}
