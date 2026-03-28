import models from '../../models/index.js';

const { Rating, Product } = models;

export const createRatingController = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { seller_id, product_id, rating, feedback } = req.body;

    if (!seller_id || !product_id || !rating) {
      return res.status(400).json({ message: 'seller_id, product_id, and rating are required' });
    }

    const sellerId = Number(seller_id);
    const productId = Number(product_id);
    if (!Number.isInteger(sellerId) || !Number.isInteger(productId) || sellerId <= 0 || productId <= 0) {
      return res.status(400).json({ message: 'seller_id and product_id must be valid integers' });
    }

    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
    }

    const product = await Product.findByPk(productId, {
      attributes: ['id', 'user_id'],
    });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (Number(product.user_id) !== sellerId) {
      return res.status(400).json({
        message: 'Seller does not match product owner',
      });
    }

    if (buyerId === sellerId) {
      return res.status(400).json({ message: 'You cannot rate yourself' });
    }

    // Idempotent: if buyer already rated this product, return existing
    const existing = await Rating.findOne({
      where: { buyer_id: buyerId, product_id: productId },
    });
    if (existing) {
      return res.status(200).json({
        message: 'Rating already submitted',
        rating: existing,
        already_submitted: true,
      });
    }

    const newRating = await Rating.create({
      buyer_id: buyerId,
      seller_id: sellerId,
      product_id: productId,
      rating: ratingValue,
      feedback: feedback?.trim() || null,
    });

    return res.status(201).json({
      message: 'Rating submitted successfully',
      rating: newRating,
      already_submitted: false,
    });
  } catch (error) {
    console.error('createRatingController error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
