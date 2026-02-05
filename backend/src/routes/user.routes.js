import express from 'express';

import getUserController from '../controllers/user/get_user.controller.js';
import updateUserController from '../controllers/user/update_user.controller.js';
import updateAvatarController from '../controllers/user/update_avatar.controller.js';
import getUserProductsController from '../controllers/user/get_user_products.controller.js';
import getUserConversationsController from '../controllers/user/get_user_conversations.controller.js';

const router = express.Router();

router.get('/:id', getUserController); // get
router.put('/:id', updateUserController); // put
router.put('/:id/avatar', updateAvatarController); // put

router.get('/:id/products', getUserProductsController); // get
router.get('/:id/conversations', getUserConversationsController); // get

export default router;
