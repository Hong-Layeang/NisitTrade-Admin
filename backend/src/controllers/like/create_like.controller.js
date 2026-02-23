import models from '../../models/index.js';

const { Like, Product, User } = models;

export default async function createLikeController(req, res) {
  try {
    const { productId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if user already liked this product
    const existingLike = await Like.findOne({
      where: { user_id: userId, product_id: productId }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Already liked this product' });
    }

    // Create the like
    const like = await Like.create({
      user_id: userId,
      product_id: productId
    });

    res.status(201).json(like);
  } catch (error) {
    console.error('Error creating like:', error);
    res.status(500).json({
      message: 'Failed to create like',
      error: error.message
    });
  }
}
