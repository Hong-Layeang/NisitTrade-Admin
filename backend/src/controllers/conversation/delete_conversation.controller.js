import { Op } from 'sequelize';

import models from '../../models/index.js';

const { Conversation, ConversationParticipant, Message, MessageRead } = models;

export default async function deleteConversationController(req, res) {
  try {
    const conversationId = Number.parseInt(req.params.id, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!Number.isInteger(conversationId) || conversationId <= 0) {
      return res.status(400).json({ message: 'Invalid conversation id' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: conversationId, user_id: userId },
    });

    if (!participant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const conversation = await Conversation.findByPk(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    await Conversation.sequelize.transaction(async transaction => {
      const messages = await Message.findAll({
        where: { conversation_id: conversationId },
        attributes: ['id'],
        transaction,
      });

      const messageIds = messages
        .map((message) => Number(message.id))
        .filter((messageId) => Number.isInteger(messageId) && messageId > 0);

      if (messageIds.length > 0) {
        await MessageRead.destroy({
          where: { message_id: { [Op.in]: messageIds } },
          transaction,
        });

        await Message.destroy({
          where: { id: { [Op.in]: messageIds } },
          transaction,
        });
      }

      await conversation.update(
        {
          updatedAt: new Date(),
        },
        { transaction },
      );
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return res.status(500).json({
      message: 'Failed to delete conversation',
      error: error.message,
    });
  }
}
