import express from 'express';

import createConversationController from '../controllers/conversation/create_conversation.controller.js';
import listConversationsController from '../controllers/conversation/list_conversations.controller.js';
import getConversationController from '../controllers/conversation/get_conversation.controller.js';
import getConversationParticipantsController from '../controllers/conversation/get_conversation_participants.controller.js';
import deleteConversationController from '../controllers/conversation/delete_conversation.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, requireRole('user'), createConversationController); // post
router.get('/', authMiddleware, requireRole('user'), listConversationsController); // get
router.get('/:id', authMiddleware, requireRole('user'), getConversationController); // get
router.get('/:id/participants', authMiddleware, requireRole('user'), getConversationParticipantsController); // get
router.delete('/:id', authMiddleware, requireRole('user'), deleteConversationController); // delete for current user

export default router;
