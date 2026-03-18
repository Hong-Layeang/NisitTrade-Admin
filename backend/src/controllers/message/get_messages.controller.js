import models from '../../models/index.js';

const { Message, ConversationParticipant, User, MessageRead, Product, ProductImage } = models;

export default async function getMessagesController(req, res) {
  try {
    const { conversationId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: conversationId, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { count, rows } = await Message.findAndCountAll({
      where: { conversation_id: conversationId },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
        },
        {
          model: MessageRead,
          attributes: ['message_id', 'user_id', 'read_at']
        },
        {
          model: Product,
          as: 'AttachedProduct',
          attributes: ['id', 'title', 'price', 'status', 'user_id', 'category_id', 'created_at', 'updated_at'],
          include: [
            {
              model: ProductImage,
              attributes: ['id', 'image_url', 'product_id', 'created_at', 'updated_at']
            }
          ]
        }
      ],
      order: [['sent_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      total: count,
      limit: parseInt(limit),
      offset: parseInt(offset),
      items: rows
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      message: 'Failed to fetch messages',
      error: error.message
    });
  }
}
