import models from '../../models/index.js';

const { Conversation, ConversationParticipant, Product, ProductImage, User } = models;

export default async function getConversationController(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const participant = await ConversationParticipant.findOne({
      where: { conversation_id: id, user_id: userId }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const conversation = await Conversation.findByPk(id, {
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
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const participants = await ConversationParticipant.findAll({
      where: { conversation_id: id },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        }
      ],
      order: [['joined_at', 'ASC']]
    });

    res.json({
      ...conversation.toJSON(),
      participants,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
}
