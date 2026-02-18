import models from '../../models/index.js';

export const listProductsController = async (req, res) => {
  try {
    const products = await models.Product.findAll({
      include: [{ model: models.ProductImage }],
      order: [['created_at', 'DESC']],
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
