// controllers/category/update_category.controller.js
import models from '../../models/index.js';

export const updateCategoryController = async (req, res) => {
    try {
        const { id } = req.params;  // Get ID from URL
        const { name } = req.body;  // New name from request body

        if (!id) return res.status(400).json({ message: 'Category ID is required' });

        // Update category
        const [updatedRows] = await models.Category.update(
            { name },           // fields to update
            { where: { id } }   // <-- THIS IS REQUIRED
        );

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        const updatedCategory = await models.Category.findByPk(id);
        res.json(updatedCategory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
