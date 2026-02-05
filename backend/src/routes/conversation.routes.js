import express from 'express';

import createConversationController from '../controllers/conversation/create_conversation.controller.js';
import listConversationsController from '../controllers/conversation/list_conversations.controller.js';
import getConversationController from '../controllers/conversation/get_conversation.controller.js';
import getConversationParticipantsController from '../controllers/conversation/get_conversation_participants.controller.js';

const router = express.Router();

router.post('/', createConversationController); // post
router.get('/', listConversationsController); // get
router.get('/:id', getConversationController); // get
router.get('/:id/participants', getConversationParticipantsController); // get

export default router;
