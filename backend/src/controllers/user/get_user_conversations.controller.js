import models from '../../models/index.js';

const { ConversationParticipant, Conversation, Product, ProductImage } = models;

export default async function getUserConversationsController(req, res) {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (String(requesterId) !== String(id) && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const conversations = await ConversationParticipant.findAll({
      where: { user_id: id },
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
      order: [['joined_at', 'DESC']]
    });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({
      message: 'Failed to fetch user conversations',
      error: error.message
    });
  }
}
