import express from 'express';

import getMessagesController from '../controllers/message/get_messages.controller.js';
import sendMessageController from '../controllers/message/send_message.controller.js';
import editMessageController from '../controllers/message/edit_message.controller.js';
import deleteMessagesController from '../controllers/message/delete_messages.controller.js';
import markAsReadController from '../controllers/message/mark_as_read.controller.js';
import getReadersController from '../controllers/message/get_readers.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadChatImages } from '../middlewares/upload.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

// messages in a conversation
router.get('/conversation/:conversationId', authMiddleware, requireRole('user'), getMessagesController); // get
router.post(
  '/conversation/:conversationId',
  authMiddleware,
  requireRole('user'),
  uploadChatImages,
  sendMessageController,
); // post

// edit / delete
router.patch('/:id', authMiddleware, requireRole('user'), editMessageController);
router.post('/delete', authMiddleware, requireRole('user'), deleteMessagesController);

// read receipts
router.post('/:id/read', authMiddleware, requireRole('user'), markAsReadController); // post
router.get('/:id/readers', authMiddleware, requireRole('user'), getReadersController); // get

export default router;
