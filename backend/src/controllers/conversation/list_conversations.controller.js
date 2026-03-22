import { Op } from 'sequelize';

import models from '../../models/index.js';
import { getUserBlockStatuses } from '../../utils/user-blocks.js';
import { getPresenceForUserIds } from '../../websockets/presence.socket.js';

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
    let blockStatusByConversation = {};
    if (conversationIds.length > 0) {
      const messages = await Message.findAll({
        where: { conversation_id: { [Op.in]: conversationIds } },
        include: [
          {
            model: User,
            attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'last_seen_at']
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
            attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at', 'last_seen_at'],
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

      const otherUserIds = participants
        .map((participant) => Number(participant.user_id))
        .filter((participantUserId) => participantUserId > 0);
      const allPresenceUserIds = Array.from(new Set([
        ...otherUserIds,
        ...messages
          .map((message) => Number(message.sender_id))
          .filter((senderId) => senderId > 0),
      ]));

      const [blockStatuses, presenceByUserId] = await Promise.all([
        getUserBlockStatuses(userId, otherUserIds),
        getPresenceForUserIds(allPresenceUserIds),
      ]);

      blockStatusByConversation = participants.reduce((acc, participant) => {
        const key = String(participant.conversation_id);
        acc[key] = blockStatuses.get(Number(participant.user_id)) ?? {
          isBlockedByMe: false,
          hasBlockedMe: false,
        };
        return acc;
      }, {});

      participantsByConversation = participants.reduce((acc, participantEntry) => {
        const participant = participantEntry.toJSON();
        const key = String(participant.conversation_id);

        if (!acc[key]) {
          acc[key] = [];
        }

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

        acc[key].push(participant);
        return acc;
      }, {});

      lastMessageByConversation = Object.entries(lastMessageByConversation).reduce((acc, [key, messageEntry]) => {
        const message = messageEntry.toJSON ? messageEntry.toJSON() : messageEntry;
        const senderUserId = Number(message.sender_id);
        const presence = presenceByUserId.get(senderUserId) ?? {
          is_online: false,
          last_seen_at: message.User?.last_seen_at ?? null,
        };

        if (message.User) {
          message.User = {
            ...message.User,
            is_online: presence.is_online,
            last_seen_at: presence.last_seen_at,
          };
        }

        acc[key] = message;
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
        is_blocked_by_me: blockStatusByConversation[key]?.isBlockedByMe ?? false,
        has_blocked_me: blockStatusByConversation[key]?.hasBlockedMe ?? false,
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
