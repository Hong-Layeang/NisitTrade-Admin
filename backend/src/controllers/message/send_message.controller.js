import models from '../../models/index.js';

const { Message, Conversation, ConversationParticipant, User, Product, ProductImage } = models;

export default async function sendMessageController(req, res) {
	try {
		const { conversationId } = req.params;
		const { message_text, attached_product_id } = req.body;
		const userId = req.user?.id;
    const uploadedImageUrls = Array.isArray(req.files)
      ? req.files
          .map((file) => file?.key ?? file?.location)
          .filter((value) => typeof value === 'string' && value.trim() !== '')
      : [];
    const normalizedMessageText = String(message_text ?? '').trim();

		if (!userId) {
			return res.status(401).json({ message: 'Unauthorized' });
		}

		if (
      normalizedMessageText === '' &&
      uploadedImageUrls.length === 0 &&
      attached_product_id == null
    ) {
			return res.status(400).json({ message: 'Message text, image, or product attachment is required' });
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
			message_text: normalizedMessageText,
			attached_product_id: attached_product_id ?? null,
      image_urls: uploadedImageUrls,
		});

    await conversation.update({
      updatedAt: new Date(),
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
