import models from '../../models/index.js';

const { Category } = models;

export default async function getCategoryController(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' 
      });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ 
      message: 'Failed to fetch category',
      error: error.message 
    });
  }
}
