import models from '../../models/index.js';

const { Rating, User, Product } = models;

export const createRatingController = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { seller_id, product_id, rating, feedback } = req.body;

    if (!seller_id || !product_id || !rating) {
      return res.status(400).json({ message: 'seller_id, product_id, and rating are required' });
    }

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    if (buyerId === Number(seller_id)) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    // Idempotent: if buyer already rated this product, return existing
    const existing = await Rating.findOne({
      where: { buyer_id: buyerId, product_id },
    });
    if (existing) {
      return res.status(200).json({ message: 'Rating already submitted', rating: existing });
    }

    const newRating = await Rating.create({
      buyer_id: buyerId,
      seller_id: Number(seller_id),
      product_id: Number(product_id),
      rating: ratingValue,
      feedback: feedback?.trim() || null,
    });

    return res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
  } catch (error) {
    console.error('createRatingController error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
