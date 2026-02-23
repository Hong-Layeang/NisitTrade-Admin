import express from 'express';
import createCommentController from '../controllers/comment/create_comment.controller.js';
import getProductCommentsController from '../controllers/comment/get_product_comments.controller.js';
import updateCommentController from '../controllers/comment/update_comment.controller.js';
import deleteCommentController from '../controllers/comment/delete_comment.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Comment routes
router.post('/', authMiddleware, createCommentController); // POST /products/:productId/comments
router.get('/', authMiddleware, getProductCommentsController); // GET /products/:productId/comments
router.put('/:commentId', authMiddleware, updateCommentController); // PUT /products/:productId/comments/:commentId
router.delete('/:commentId', authMiddleware, deleteCommentController); // DELETE /products/:productId/comments/:commentId

export default router;
