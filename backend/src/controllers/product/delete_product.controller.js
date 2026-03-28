import models from '../../models/index.js';
import { connectDB } from '../../models/index.js';

const { Product, Like, Comment, SavedItem, Report } = models;

export default async function deleteProductController(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const user_role = req.user?.role;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    // Check if user owns the product
    if (user_id && product.user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ 
        message: 'You do not have permission to delete this product' 
      });
    }

    await connectDB.transaction(async (transaction) => {
      await Promise.all([
        Like.destroy({
          where: {
            likeable_type: 'Product',
            likeable_id: id,
          },
          transaction,
        }),
        Comment.destroy({
          where: {
            commentable_type: 'Product',
            commentable_id: id,
          },
          transaction,
        }),
        SavedItem.destroy({
          where: {
            saveable_type: 'Product',
            saveable_id: id,
          },
          transaction,
        }),
        Report.destroy({
          where: {
            reportable_type: 'Product',
            reportable_id: id,
          },
          transaction,
        }),
      ]);

      // ProductImages are cascade deleted by association.
      await product.destroy({ transaction });
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Failed to delete product',
      error: error.message 
    });
  }
}
