import models from '../../models/index.js';

export const getCategoryByIdController = async (req, res) => {
    try {
        const { id } = req.params; // <-- req.params, not req.parms
        if (!id) {
            return res.status(400).json({ message: 'ID is required' });
        }

        const category = await models.Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json(category);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
