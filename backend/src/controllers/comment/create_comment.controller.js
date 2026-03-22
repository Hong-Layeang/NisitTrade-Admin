import models from '../../models/index.js';

const { Product, Comment, User } = models;

export default async function createCommentController(req, res) {
  try {
    const productId = parseInt(req.params.productId, 10);
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!req.body?.content || !req.body.content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const content = req.body.content.trim();
    if (content.length > 500) {
      return res.status(400).json({ error: 'Comment must be 500 characters or less' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const comment = await Comment.create({
      commentable_type: 'Product',
      commentable_id: productId,
      user_id: userId,
      content,
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id']
        }
      ]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Error creating comment:', error);
    
    // Handle specific database constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ error: 'Duplicate entry' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(404).json({ error: 'User or product not found' });
    }
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: 'Invalid data provided' });
    }

    // Generic server error
    const status = error.message?.includes('not found') ? 404 : 500;
    res.status(status).json({ error: 'Failed to process comment. Please try again.' });
  }
}
