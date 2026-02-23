import models from '../../models/index.js';

const { Product, User, Category, ProductImage } = models;

export default async function updateProductController(req, res) {
  try {
    const { id } = req.params;
    const { title, description, price, category_id } = req.body;
    const user_id = req.user?.id;
    const user_role = req.user?.role;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    // Check if user owns the product (optional, depends on your auth requirements)
    if (user_id && product.user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ 
        message: 'You do not have permission to update this product' 
      });
    }

    const updates = {};

    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ 
          message: 'Product title cannot be empty' 
        });
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description?.trim() || null;
    }

    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ 
          message: 'Price must be greater than 0' 
        });
      }
      updates.price = price;
    }

    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id);
      if (!category) {
        return res.status(404).json({ 
          message: 'Category not found' 
        });
      }
      updates.category_id = category_id;
    }

    await product.update(updates);

    // Fetch updated product with associations
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

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ 
      message: 'Failed to update product',
      error: error.message 
    });
  }
}
