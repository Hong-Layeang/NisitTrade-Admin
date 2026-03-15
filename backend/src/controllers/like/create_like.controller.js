import models from '../../models/index.js';

const { Product, Like } = models;

export default async function createLikeController(req, res) {
  try {
    const productId = parseInt(req.params.productId, 10);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Try to create like
    const [like, created] = await Like.findOrCreate({
      where: {
        likeable_type: 'Product',
        likeable_id: productId,
        user_id: userId,
      },
      defaults: {
        likeable_type: 'Product',
        likeable_id: productId,
        user_id: userId,
      },
    });

    if (!created) {
      return res.status(409).json({ error: 'Already liked' });
    }

    res.status(201).json(like);
  } catch (error) {
    console.error('Error creating like:', error);
    
    // Handle specific database constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Already liked' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({ error: 'User or product not found' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Generic server error
    const status = error.message?.includes('not found') ? 404 : 500;
    res.status(status).json({ error: 'Failed to process like. Please try again.' });
  }
}
