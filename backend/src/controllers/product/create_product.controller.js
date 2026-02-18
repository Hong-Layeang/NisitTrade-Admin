import models from '../../models/index.js';

export const createProductController = async (req, res) => {
  try {
    const { title, description, price, category_id, user_id } = req.body;

    if (!title || !price || !category_id || !user_id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const product = await models.Product.create({
      title,
      description,
      price,
      category_id,
      user_id,
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
