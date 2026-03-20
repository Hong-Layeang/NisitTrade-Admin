import models from '../../models/index.js';
import { getUserBlockStatus } from '../../utils/user-blocks.js';
import { getPresenceForUserIds } from '../../websockets/presence.socket.js';

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
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at', 'last_seen_at']
        }
      ],
      order: [['joined_at', 'ASC']]
    });

    const participantUserIds = participants
      .map((entry) => Number(entry.user_id))
      .filter((entryUserId) => entryUserId > 0);
    const presenceByUserId = await getPresenceForUserIds(participantUserIds);

    const participantsWithPresence = participants.map((entry) => {
      const participant = entry.toJSON();
      const participantUserId = Number(participant.user_id);
      const presence = presenceByUserId.get(participantUserId) ?? {
        is_online: false,
        last_seen_at: participant.User?.last_seen_at ?? null,
      };

      if (participant.User) {
        participant.User = {
          ...participant.User,
          is_online: presence.is_online,
          last_seen_at: presence.last_seen_at,
        };
      }

      return participant;
    });

    const otherParticipant = participants.find((entry) =>
      Number(entry.user_id) > 0 && Number(entry.user_id) !== Number(userId)
    );
    const blockStatus = otherParticipant
      ? await getUserBlockStatus(userId, otherParticipant.user_id)
      : { isBlockedByMe: false, hasBlockedMe: false };

    res.json({
      ...conversation.toJSON(),
      participants: participantsWithPresence,
      is_blocked_by_me: blockStatus.isBlockedByMe,
      has_blocked_me: blockStatus.hasBlockedMe,
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    res.status(500).json({
      message: 'Failed to fetch conversation',
      error: error.message
    });
  }
}
