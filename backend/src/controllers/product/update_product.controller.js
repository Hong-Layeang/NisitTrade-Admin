import models from '../../models/index.js';

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category_id } = req.body;

    const [updatedRows] = await models.Product.update(
      { title, description, price, category_id },
      { where: { id } }
    );

    if (updatedRows === 0) return res.status(404).json({ message: 'Product not found' });

    const updatedProduct = await models.Product.findByPk(id, {
      include: [{ model: models.ProductImage }],
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
