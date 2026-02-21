import models from "../../models/index.js";

const { Category } = models;

export const listCategoriesController = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
