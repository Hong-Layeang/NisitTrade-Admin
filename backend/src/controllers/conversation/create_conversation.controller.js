import { Op } from 'sequelize';

import models from '../../models/index.js';

const { Conversation, ConversationParticipant, Product, ProductImage } = models;

export default async function createConversationController(req, res) {
  try {
    const { product_id } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!product_id) {
      return res.status(400).json({ message: 'Product is required' });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (String(product.user_id) === String(userId)) {
      return res.status(400).json({ message: 'Cannot create conversation with your own product' });
    }

    const conversations = await Conversation.findAll({
      where: { product_id },
      attributes: ['id']
    });

    if (conversations.length > 0) {
      const conversationIds = conversations.map(item => item.id);
      const participants = await ConversationParticipant.findAll({
        where: {
          conversation_id: { [Op.in]: conversationIds },
          user_id: { [Op.in]: [userId, product.user_id] }
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
        set.has(String(userId)) && set.has(String(product.user_id))
      )?.[0];

      if (existingConversationId) {
        const existingConversation = await Conversation.findByPk(existingConversationId, {
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

        return res.status(200).json(existingConversation);
      }
    }

    const conversation = await Conversation.create({ product_id });

    const participantIds = [userId, product.user_id].filter((value, index, array) =>
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

    const createdConversation = await Conversation.findByPk(conversation.id, {
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

    res.status(201).json(createdConversation);
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      message: 'Failed to create conversation',
      error: error.message
    });
  }
}
