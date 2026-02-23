import models from '../../models/index.js';

const { Product } = models;

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

    // ProductImages will be cascade deleted due to model association
    await product.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      message: 'Failed to delete product',
      error: error.message 
    });
  }
}
