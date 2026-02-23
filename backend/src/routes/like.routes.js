import express from 'express';
import createLikeController from '../controllers/like/create_like.controller.js';
import getProductLikesController from '../controllers/like/get_product_likes.controller.js';
import deleteLikeController from '../controllers/like/delete_like.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

// Like routes
router.post('/', authMiddleware, createLikeController); // POST /products/:productId/likes
router.get('/', authMiddleware, getProductLikesController); // GET /products/:productId/likes
router.delete('/:likeId', authMiddleware, deleteLikeController); // DELETE /products/:productId/likes/:likeId

export default router;
