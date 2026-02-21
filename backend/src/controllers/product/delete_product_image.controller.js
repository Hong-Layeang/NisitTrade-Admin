import models from '../../models/index.js';

export const deleteProductImageController = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRows = await models.ProductImage.destroy({ where: { id } });
    if (!deletedRows) return res.status(404).json({ message: 'Product image not found' });

    res.json({ message: 'Product image deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
