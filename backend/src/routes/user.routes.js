import express from 'express';

import getAllUsersController from '../controllers/user/get_all_users.controller.js';
import getUserController from '../controllers/user/get_user.controller.js';
import updateUserController from '../controllers/user/update_user.controller.js';
import updateAvatarController from '../controllers/user/update_avatar.controller.js';
import updateCoverController from '../controllers/user/update_cover.controller.js';
import getUserProductsController from '../controllers/user/get_user_products.controller.js';
import getUserConversationsController from '../controllers/user/get_user_conversations.controller.js';
import getUserSavedListingsController from '../controllers/saved/get_user_saved_listings.controller.js';
import getUserSavedCommunityPostsController from '../controllers/saved/get_user_saved_community_posts.controller.js';
import followUserController from '../controllers/user/follow_user.controller.js';
import unfollowUserController from '../controllers/user/unfollow_user.controller.js';
import blockUserController from '../controllers/user/block_user.controller.js';
import unblockUserController from '../controllers/user/unblock_user.controller.js';
import createUserReportController from '../controllers/user/create_user_report.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadAvatar, uploadCover } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getAllUsersController); // get all users (with optional ?search=)
router.get('/:id', authMiddleware, getUserController); // get
router.put('/:id', authMiddleware, updateUserController); // put
router.put('/:id/avatar', authMiddleware, uploadAvatar, updateAvatarController); // put
router.put('/:id/cover', authMiddleware, uploadCover, updateCoverController); // put

router.get('/:id/products', authMiddleware, getUserProductsController); // get
router.get('/:id/conversations', authMiddleware, getUserConversationsController); // get
router.get('/:id/saved', authMiddleware, getUserSavedListingsController); // get
router.get('/:id/saved/posts', authMiddleware, getUserSavedCommunityPostsController); // get saved posts

router.post('/:id/follow', authMiddleware, followUserController); // follow
router.delete('/:id/follow', authMiddleware, unfollowUserController); // unfollow
router.post('/:id/reports', authMiddleware, createUserReportController); // report user
router.post('/:id/block', authMiddleware, blockUserController); // block user
router.delete('/:id/block', authMiddleware, unblockUserController); // unblock user

export default router;
