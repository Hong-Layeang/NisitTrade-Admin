import express from 'express';

import getUserController from '../controllers/user/get_user.controller.js';
import updateUserController from '../controllers/user/update_user.controller.js';
import updateAvatarController from '../controllers/user/update_avatar.controller.js';
import getUserProductsController from '../controllers/user/get_user_products.controller.js';
import getUserConversationsController from '../controllers/user/get_user_conversations.controller.js';
import getUserSavedListingsController from '../controllers/saved/get_user_saved_listings.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadAvatar } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/:id', authMiddleware, getUserController); // get
router.put('/:id', authMiddleware, updateUserController); // put
router.put('/:id/avatar', authMiddleware, uploadAvatar, updateAvatarController); // put

router.get('/:id/products', authMiddleware, getUserProductsController); // get
router.get('/:id/conversations', authMiddleware, getUserConversationsController); // get
router.get('/:id/saved', authMiddleware, getUserSavedListingsController); // get

export default router;
