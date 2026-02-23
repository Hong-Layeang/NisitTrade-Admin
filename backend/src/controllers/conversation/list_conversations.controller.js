import { Op } from 'sequelize';

import models from '../../models/index.js';

const { ConversationParticipant, Conversation, Product, ProductImage, Message, User } = models;

export default async function listConversationsController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { limit = 50, offset = 0 } = req.query;

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
      order: [['joined_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const conversationIds = conversations
      .map(entry => entry.conversation_id)
      .filter(Boolean);

    let lastMessageByConversation = {};
    if (conversationIds.length > 0) {
      const messages = await Message.findAll({
        where: { conversation_id: { [Op.in]: conversationIds } },
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
          }
        ],
        order: [['sent_at', 'DESC']]
      });

      lastMessageByConversation = messages.reduce((acc, message) => {
        const key = String(message.conversation_id);
        if (!acc[key]) {
          acc[key] = message;
        }
        return acc;
      }, {});
    }

    const response = conversations.map(entry => {
      const entryJson = entry.toJSON();
      const key = String(entryJson.conversation_id);
      return {
        ...entryJson,
        last_message: lastMessageByConversation[key] || null,
      };
    });

    res.json({
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
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
