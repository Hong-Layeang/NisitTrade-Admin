import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Product, User, Category, ProductImage, Like, Comment } = models;

export default async function listProductsController(req, res) {
  try {
    const { 
      category_id, 
      status, 
      search, 
      limit = 50, 
      offset = 0 
    } = req.query;
    const requesterRole = req.user?.role;

    const where = {};

    // Filter by category
    if (category_id) {
      where.category_id = category_id;
    }

    // Filter by status
    if (status) {
      if (status === 'hidden' && requesterRole !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
      }
      where.status = status;
    } else {
      where.status = { [Op.ne]: 'hidden' };
    }

    // Search in title and description
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const products = await Product.findAll({
      where,
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
        },
        {
          model: Like,
          attributes: ['id', 'user_id', 'product_id', 'created_at', 'updated_at'],
          include: [
            {
              model: User,
              attributes: ['id', 'full_name', 'profile_image']
            }
          ]
        },
        {
          model: Comment,
          attributes: ['id', 'content', 'rating', 'user_id', 'product_id', 'created_at', 'updated_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    products.forEach(product => {
      if (product?.ProductImages) {
        product.ProductImages.sort((a, b) => {
          const aCreated = new Date(a.createdAt ?? a.created_at ?? 0);
          const bCreated = new Date(b.createdAt ?? b.created_at ?? 0);
          const createdDiff = aCreated - bCreated;
          if (createdDiff !== 0) return createdDiff;
          return (a.id ?? 0) - (b.id ?? 0);
        });
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
}
