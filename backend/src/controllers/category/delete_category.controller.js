import models from '../../models/index.js';

const { Category, Product } = models;

export default async function deleteCategoryController(req, res) {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ 
        message: 'Category not found' 
      });
    }

    // Check if category has products
    const productCount = await Product.count({ 
      where: { category_id: id } 
    });

    if (productCount > 0) {
      return res.status(409).json({ 
        message: `Cannot delete category with ${productCount} associated products` 
      });
    }

    await category.destroy();

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      message: 'Failed to delete category',
      error: error.message 
    });
  }
}
