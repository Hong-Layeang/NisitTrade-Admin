import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { createRatingController } from '../controllers/rating/create_rating.controller.js';
import { getSellerRatingsController } from '../controllers/rating/get_seller_ratings.controller.js';

const router = express.Router();

// POST /api/ratings — Submit a purchase rating
router.post('/', authMiddleware, createRatingController);

// GET /api/ratings/seller/:id — Get all ratings for a seller
router.get('/seller/:id', authMiddleware, getSellerRatingsController);

export default router;
