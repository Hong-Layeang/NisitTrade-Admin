import models from '../../models/index.js';
import { writeActivityLog } from '../../utils/activity-log.js';

const { Product, ProductImage, User, Category } = models;

export default async function createProductController(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, price, category_id, image_urls } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!price || price <= 0) {
      return res.status(400).json({ error: 'Price must be greater than 0' });
    }
    if (!category_id) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Create product
    const product = await Product.create({
      user_id: userId,
      title: title.trim(),
      description: description?.trim() || null,
      price,
      category_id,
      status: 'available',
    });

    // Create product images if provided
    if (Array.isArray(image_urls) && image_urls.length > 0) {
      await ProductImage.bulkCreate(
        image_urls.map(url => ({
          product_id: product.id,
          image_url: url,
        }))
      );
    }

    // Fetch full product with relations
    const fullProduct = await Product.findByPk(product.id, {
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
          attributes: ['id', 'image_url', 'created_at', 'updated_at']
        }
      ]
    });

    await writeActivityLog({
      actionType: 'product_created',
      message: `Product created: ${product.title}`,
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      targetType: 'Product',
      targetId: product.id,
      metadata: { title: product.title },
    });

    res.status(201).json(fullProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    const status = error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
}
