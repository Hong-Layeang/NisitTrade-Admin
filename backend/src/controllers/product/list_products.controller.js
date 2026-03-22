import models from '../../models/index.js';
import { Op } from 'sequelize';
import { enrichProductsWithPresignedUrls } from '../../utils/s3-presigned-url.js';

const { Product, User, Category, ProductImage, Like, Comment, University } = models;

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
          as: 'Likes',
          attributes: ['id', 'user_id', 'likeable_id', 'likeable_type', 'created_at', 'updated_at'],
          where: {
            likeable_type: 'Product'
          },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'full_name', 'profile_image']
            }
          ]
        },
        {
          model: Comment,
          as: 'Comments',
          attributes: ['id', 'content', 'rating', 'user_id', 'commentable_id', 'commentable_type', 'created_at', 'updated_at'],
          where: {
            commentable_type: 'Product'
          },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id'],
              include: [
                {
                  model: University,
                  attributes: ['id', 'name', 'domain']
                }
              ]
            }
          ]
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

      // Sort comments by created_at in descending order (newest first)
      if (product?.Comments) {
        product.Comments.sort((a, b) => {
          const aCreated = new Date(a.createdAt ?? a.created_at ?? 0);
          const bCreated = new Date(b.createdAt ?? b.created_at ?? 0);
          const createdDiff = bCreated - aCreated; // Note: reversed for DESC order
          if (createdDiff !== 0) return createdDiff;
          return (b.id ?? 0) - (a.id ?? 0); // Newer IDs first if same time
        });
      }
    });

    // Enrich all products with pre-signed URLs
    const enrichedProducts = await enrichProductsWithPresignedUrls(products);

    res.json(enrichedProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ 
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
}
