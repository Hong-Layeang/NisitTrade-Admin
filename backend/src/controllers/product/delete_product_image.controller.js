import models from '../../models/index.js';

const { Product, ProductImage } = models;

export default async function deleteProductImageController(req, res) {
  try {
    const { id, imageId } = req.params;
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
        message: 'You do not have permission to delete images from this product' 
      });
    }

    const productImage = await ProductImage.findOne({
      where: {
        id: imageId,
        product_id: id
      }
    });

    if (!productImage) {
      return res.status(404).json({ 
        message: 'Product image not found' 
      });
    }

    await productImage.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting product image:', error);
    res.status(500).json({ 
      message: 'Failed to delete product image',
      error: error.message 
    });
  }
}
