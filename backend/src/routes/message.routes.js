import express from 'express';

import getMessagesController from '../controllers/message/get_messages.controller.js';
import sendMessageController from '../controllers/message/send_message.controller.js';
import markAsReadController from '../controllers/message/mark_as_read.controller.js';
import getReadersController from '../controllers/message/get_readers.controller.js';

const router = express.Router();

// messages in a conversation
router.get('/conversation/:conversationId', getMessagesController); // get
router.post('/conversation/:conversationId', sendMessageController); // post

// read receipts
router.post('/:id/read', markAsReadController); // post
router.get('/:id/readers', getReadersController); // get

export default router;
