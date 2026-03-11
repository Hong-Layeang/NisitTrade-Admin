import express from 'express';

import listCommunityPostsController from '../controllers/community/list_posts.controller.js';
import createCommunityPostController from '../controllers/community/create_post.controller.js';
import getCommunityPostController from '../controllers/community/get_post.controller.js';
import createCommunityLikeController from '../controllers/community/create_like.controller.js';
import deleteCommunityLikeController from '../controllers/community/delete_like.controller.js';
import createCommunityCommentController from '../controllers/community/create_comment.controller.js';
import updateCommunityCommentController from '../controllers/community/update_comment.controller.js';
import deleteCommunityCommentController from '../controllers/community/delete_comment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadCommunityImages } from '../middlewares/upload.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, listCommunityPostsController);
router.post('/', authMiddleware, uploadCommunityImages, createCommunityPostController);
router.get('/:postId', authMiddleware, getCommunityPostController);
router.post('/:postId/likes', authMiddleware, createCommunityLikeController);
router.delete('/:postId/likes', authMiddleware, deleteCommunityLikeController);
router.post('/:postId/comments', authMiddleware, createCommunityCommentController);
router.put('/:postId/comments/:commentId', authMiddleware, updateCommunityCommentController);
router.delete('/:postId/comments/:commentId', authMiddleware, deleteCommunityCommentController);

export default router;
