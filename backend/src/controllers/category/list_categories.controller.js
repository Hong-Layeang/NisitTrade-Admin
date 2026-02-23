import models from '../../models/index.js';

const { Category } = models;

export default async function listCategoriesController(req, res) {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']],
    });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      message: 'Failed to fetch categories',
      error: error.message 
    });
  }
}