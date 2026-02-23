import models from '../../models/index.js';

const { Category } = models;

export default async function createCategoryController(req, res) {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ 
        message: 'Category name is required' 
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      where: { name: name.trim() } 
    });

    if (existingCategory) {
      return res.status(409).json({ 
        message: 'Category already exists' 
      });
    }

    const category = await Category.create({ 
      name: name.trim() 
    });

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      message: 'Failed to create category',
      error: error.message 
    });
  }
}
