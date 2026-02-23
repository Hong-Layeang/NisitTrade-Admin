import models from '../../models/index.js';
import { Op } from 'sequelize';

const { Category } = models;

export default async function updateCategoryController(req, res) {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        message: 'Category name is required' 
      });
    }

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' 
      });
    }

    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({ 
      where: { 
        name: name.trim(),
        id: { [Op.ne]: id }
      } 
    });

    if (existingCategory) {
      return res.status(409).json({ 
        message: 'Category name already exists' 
      });
    }

    await category.update({ name: name.trim() });

    res.json(category);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      message: 'Failed to update category',
      error: error.message 
    });
  }
}
