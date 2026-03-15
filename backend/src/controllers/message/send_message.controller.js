import models from '../../models/index.js';

const { Message, Conversation, ConversationParticipant, User, Product, ProductImage } = models;

export default async function sendMessageController(req, res) {
	try {
		const { conversationId } = req.params;
		const { message_text, attached_product_id } = req.body;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		if (!message_text || String(message_text).trim() === '') {
			return res.status(400).json({ message: 'Message text is required' });
		}

		const conversation = await Conversation.findByPk(conversationId);
		if (!conversation) {
			return res.status(404).json({ message: 'Conversation not found' });
		}

		if (attached_product_id != null) {
			if (!conversation.product_id) {
				return res.status(400).json({ message: 'Conversation has no product context' });
			}

			if (String(attached_product_id) !== String(conversation.product_id)) {
				return res.status(400).json({
					message: 'Attached product must match the conversation product',
				});
			}
		}

		const participant = await ConversationParticipant.findOne({
			where: { conversation_id: conversationId, user_id: userId }
		});

		if (!participant) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const message = await Message.create({
			conversation_id: conversationId,
			sender_id: userId,
			message_text: String(message_text).trim(),
			attached_product_id: attached_product_id ?? null,
		});

		const createdMessage = await Message.findByPk(message.id, {
			include: [
				{
					model: User,
					attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
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
			]
		});

		res.status(201).json(createdMessage);
	} catch (error) {
		console.error('Error sending message:', error);
		res.status(500).json({
			message: 'Failed to send message',
			error: error.message
		});
	}
}