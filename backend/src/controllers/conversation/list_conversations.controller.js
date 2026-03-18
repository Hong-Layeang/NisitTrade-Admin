import { Op } from 'sequelize';

import models from '../../models/index.js';

const {
  ConversationParticipant,
  Conversation,
  Product,
  ProductImage,
  Message,
  MessageRead,
  User,
} = models;

export default async function listConversationsController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const parsedLimit = Math.max(parseInt(req.query.limit, 10) || 50, 1);
    const parsedOffset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const total = await ConversationParticipant.count({
      where: { user_id: userId }
    });

    const conversations = await ConversationParticipant.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Conversation,
          include: [
            {
              model: Product,
              attributes: ['id', 'title', 'price', 'status', 'user_id', 'category_id', 'created_at', 'updated_at'],
              include: [
                {
                  model: ProductImage,
                  attributes: ['id', 'image_url', 'product_id', 'created_at', 'updated_at']
                }
              ]
            }
          ]
        }
      ],
      order: [[Conversation, 'updated_at', 'DESC']],
      limit: parsedLimit,
      offset: parsedOffset
    });

    const conversationIds = conversations
      .map(entry => entry.conversation_id)
      .filter(Boolean);

    let lastMessageByConversation = {};
    const unreadCountByConversation = {};
    let participantsByConversation = {};
    if (conversationIds.length > 0) {
      const messages = await Message.findAll({
        where: { conversation_id: { [Op.in]: conversationIds } },
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
          },
          {
            model: MessageRead,
            attributes: ['user_id'],
            where: { user_id: userId },
            required: false,
          }
        ],
        order: [['sent_at', 'DESC']]
      });

      lastMessageByConversation = messages.reduce((acc, message) => {
        const key = String(message.conversation_id);
        if (!acc[key]) {
          acc[key] = message;
        }

        if (String(message.sender_id) !== String(userId)) {
          const currentReads = Array.isArray(message.MessageReads)
            ? message.MessageReads
            : [];
          if (currentReads.length === 0) {
            unreadCountByConversation[key] = (unreadCountByConversation[key] ?? 0) + 1;
          }
        }
        return acc;
      }, {});

      const participants = await ConversationParticipant.findAll({
        where: {
          conversation_id: { [Op.in]: conversationIds },
          user_id: { [Op.ne]: userId },
        },
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at'],
          }
        ],
      });

      participantsByConversation = participants.reduce((acc, participant) => {
        const key = String(participant.conversation_id);
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(participant);
        return acc;
      }, {});
    }

    const response = conversations.map(entry => {
      const entryJson = entry.toJSON();
      const key = String(entryJson.conversation_id);
      return {
        ...entryJson,
        unread_count: unreadCountByConversation[key] ?? 0,
        participants: participantsByConversation[key] ?? [],
        last_message: lastMessageByConversation[key] || null,
      };
    });

    res.json({
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      items: response
    });
  } catch (error) {
    console.error('Error listing conversations:', error);
    res.status(500).json({
      message: 'Failed to list conversations',
      error: error.message
    });
  }
}
