import models from '../../models/index.js';

const { Message, MessageRead, ConversationParticipant, User } = models;

export default async function getReadersController(req, res) {
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

    const readers = await MessageRead.findAll({
      where: { message_id: id },
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
        }
      ],
      order: [['read_at', 'DESC']]
    });

    res.json(readers);
  } catch (error) {
    console.error('Error fetching message readers:', error);
    res.status(500).json({
      message: 'Failed to fetch readers',
      error: error.message
    });
  }
}
