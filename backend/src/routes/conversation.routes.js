import express from 'express';

import createConversationController from '../controllers/conversation/create_conversation.controller.js';
import listConversationsController from '../controllers/conversation/list_conversations.controller.js';
import getConversationController from '../controllers/conversation/get_conversation.controller.js';
import getConversationParticipantsController from '../controllers/conversation/get_conversation_participants.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, createConversationController); // post
router.get('/', authMiddleware, listConversationsController); // get
router.get('/:id', authMiddleware, getConversationController); // get
router.get('/:id/participants', authMiddleware, getConversationParticipantsController); // get

export default router;
