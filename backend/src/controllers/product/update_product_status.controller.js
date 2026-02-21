import models from '../../models/index.js';

export const updateProductStatusController = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['available', 'reserved', 'sold'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const [updatedRows] = await models.Product.update(
      { status },
      { where: { id } }
    );

    if (updatedRows === 0) return res.status(404).json({ message: 'Product not found' });

    const updatedProduct = await models.Product.findByPk(id);
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
