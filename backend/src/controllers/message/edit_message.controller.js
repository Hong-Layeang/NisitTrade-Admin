import models from '../../models/index.js';
import { broadcastMessageUpdate } from '../../utils/websockets/chat.socket.js';

const { Message, ConversationParticipant } = models;

export default async function editMessageController(req, res) {
  try {
    const { id } = req.params;
    const { message_text } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const normalizedText = String(message_text ?? '').trim();
    if (!normalizedText) {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const message = await Message.findByPk(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    // Verify user is a participant
    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: message.conversation_id, user_id: userId },
    });
    if (!participant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const now = new Date();
    await message.update({ message_text: normalizedText, edited_at: now });

    const payload = {
      messageId: message.id,
      conversationId: message.conversation_id,
      messageText: normalizedText,
      editedAt: now.toISOString(),
    };

    res.json(payload);

    const io = req.app.get('io');
    broadcastMessageUpdate(io, message.conversation_id, payload);
  } catch (error) {
    console.error('Error editing message:', error);
    res.status(500).json({ message: 'Failed to edit message', error: error.message });
  }
}
