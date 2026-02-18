import models from '../../models/index.js';

export const getProductController = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await models.Product.findByPk(id, {
      include: [{ model: models.ProductImage }],
    });

    if (!product) return res.status(404).json({ message: 'Product not found' });

    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
