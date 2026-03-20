import { Op } from 'sequelize';

import models from '../../models/index.js';
import { getUserBlockStatus } from '../../utils/user-blocks.js';

const { Conversation, ConversationParticipant, Product, ProductImage, User } = models;

async function loadConversationPayload(conversationId, currentUserId) {
  const conversation = await Conversation.findByPk(conversationId, {
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
    return null;
  }

  const participants = await ConversationParticipant.findAll({
    where: { conversation_id: conversationId },
    include: [
      {
        model: User,
        attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
      }
    ],
    order: [['joined_at', 'ASC']]
  });

  const otherParticipant = participants.find((entry) =>
    Number(entry.user_id) > 0 && Number(entry.user_id) !== Number(currentUserId)
  );
  const blockStatus = otherParticipant
    ? await getUserBlockStatus(currentUserId, otherParticipant.user_id)
    : { isBlockedByMe: false, hasBlockedMe: false };

  return {
    ...conversation.toJSON(),
    participants,
    is_blocked_by_me: blockStatus.isBlockedByMe,
    has_blocked_me: blockStatus.hasBlockedMe,
  };
}

export default async function createConversationController(req, res) {
  try {
    const { product_id, participant_user_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!product_id && !participant_user_id) {
      return res.status(400).json({ message: 'Product or participant is required' });
    }

    let product = null;
    let otherParticipantId = participant_user_id;

    if (product_id) {
      product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      if (String(product.user_id) === String(userId)) {
        return res.status(400).json({ message: 'Cannot create conversation with your own product' });
      }

      otherParticipantId = product.user_id;
    } else if (String(otherParticipantId) === String(userId)) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    if (!Number.isInteger(Number(otherParticipantId)) || Number(otherParticipantId) <= 0) {
      return res.status(400).json({ message: 'Invalid participant user id' });
    }

    const conversationWhere = product_id
      ? { product_id }
      : { product_id: null };

    const conversations = await Conversation.findAll({
      where: conversationWhere,
      attributes: ['id']
    });

    if (conversations.length > 0) {
      const conversationIds = conversations.map(item => item.id);
      const participants = await ConversationParticipant.findAll({
        where: {
          conversation_id: { [Op.in]: conversationIds },
          user_id: { [Op.in]: [userId, otherParticipantId] }
        }
      });

      const participantMap = new Map();
      participants.forEach(entry => {
        if (!participantMap.has(entry.conversation_id)) {
          participantMap.set(entry.conversation_id, new Set());
        }
        participantMap.get(entry.conversation_id).add(String(entry.user_id));
      });

      const existingConversationId = [...participantMap.entries()].find(([, set]) =>
        set.has(String(userId)) && set.has(String(otherParticipantId))
      )?.[0];

      if (existingConversationId) {
        const existingConversation = await loadConversationPayload(existingConversationId, userId);

        return res.status(200).json(existingConversation);
      }
    }

    const blockStatus = await getUserBlockStatus(userId, otherParticipantId);
    if (blockStatus.isBlockedByMe) {
      return res.status(403).json({
        message: 'You blocked this user. Unblock them to start a conversation.',
      });
    }

    if (blockStatus.hasBlockedMe) {
      return res.status(403).json({
        message: 'This user has blocked you. Messaging is unavailable.',
      });
    }

    const conversation = await Conversation.create({
      product_id: product_id ?? null,
    });

    const participantIds = [userId, otherParticipantId].filter((value, index, array) =>
      array.indexOf(value) === index
    );

    await Promise.all(
      participantIds.map(participantId =>
        ConversationParticipant.create({
          conversation_id: conversation.id,
          user_id: participantId
        })
      )
    );

    const createdConversation = await loadConversationPayload(conversation.id, userId);

    res.status(201).json(createdConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      message: 'Failed to create conversation',
      error: error.message
    });
  }
}
