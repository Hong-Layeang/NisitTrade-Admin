import models from '../../models/index.js';

const { Message, Conversation, ConversationParticipant, User } = models;

export default async function sendMessageController(req, res) {
	try {
		const { conversationId } = req.params;
		const { message_text } = req.body;
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

		const participant = await ConversationParticipant.findOne({
			where: { conversation_id: conversationId, user_id: userId }
		});

		if (!participant) {
			return res.status(403).json({ message: 'Forbidden' });
		}

		const message = await Message.create({
			conversation_id: conversationId,
			sender_id: userId,
			message_text: String(message_text).trim()
		});

		const createdMessage = await Message.findByPk(message.id, {
			include: [
				{
					model: User,
					attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
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