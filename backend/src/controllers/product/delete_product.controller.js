import models from '../../models/index.js';

export const deleteProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await models.Product.destroy({ where: { id } });
    if (!deletedRows) return res.status(404).json({ message: 'Product not found' });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
