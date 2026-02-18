import category from "../../models/category.js";
import models from "../../models/index.js";
import message from "../../models/message.js";

const { Category } = models;
export const deleteCategoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const category = await Category.findByPk(id);

        if (!category) {
            return res.status(404).json({ message: "Category not found!" });
        }
        await category.destroy();
        res.status(200).json({ message: "Category delete sucessfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
