import models from '../../models/index.js';

const { ConversationParticipant, User } = models;

export default async function getConversationParticipantsController(req, res) {
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

    res.json(participants);
  } catch (error) {
    console.error('Error fetching conversation participants:', error);
    res.status(500).json({
      message: 'Failed to fetch conversation participants',
      error: error.message
    });
  }
}
