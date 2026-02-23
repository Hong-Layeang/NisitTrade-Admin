import models from '../../models/index.js';

const { Product, User, Category, ProductImage } = models;

export default async function hideProductController(req, res) {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const user_role = req.user?.role;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (user_id && product.user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to hide this product' });
    }

    await product.update({ status: 'hidden' });

    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'created_at', 'updated_at']
        },
        {
          model: ProductImage,
          attributes: ['id', 'image_url', 'product_id', 'created_at', 'updated_at']
        }
      ]
    });

    return res.json(updatedProduct);
  } catch (error) {
    console.error('Error hiding product:', error);
    return res.status(500).json({
      message: 'Failed to hide product',
      error: error.message
    });
  }
}
