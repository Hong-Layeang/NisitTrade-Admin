import models from '../../models/index.js';

const { Product, User, Category, ProductImage } = models;

export default async function createProductController(req, res) {
  try {
    const { title, description, price, category_id } = req.body;
    
    // user_id must come from auth middleware
    const user_id = req.user?.id;

    // Validation
    if (!title || title.trim() === '') {
      return res.status(400).json({ 
        message: 'Product title is required' 
      });
    }

    if (!price || price <= 0) {
      return res.status(400).json({ 
        message: 'Valid price is required' 
      });
    }

    if (!category_id) {
      return res.status(400).json({ 
        message: 'Category is required' 
      });
    }

    if (!user_id) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }

    // Verify category exists
    const category = await Category.findByPk(category_id);
    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' 
      });
    }

    // Verify user exists (if not, the JWT is stale)
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(401).json({ 
        message: 'User authentication required' 
      });
    }

    const product = await Product.create({
      title: title.trim(),
      description: description?.trim() || null,
      price,
      category_id,
      user_id,
      status: 'available'
    });

    // Fetch the created product with associations
    const createdProduct = await Product.findByPk(product.id, {
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

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      message: 'Failed to create product',
      error: error.message 
    });
  }
}
