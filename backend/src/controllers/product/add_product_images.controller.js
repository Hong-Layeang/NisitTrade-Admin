import models from '../../models/index.js';

export const addProductImagesController = async (req, res) => {
  try {
    const { product_id, images } = req.body;

    if (!product_id || !images?.length) {
      return res.status(400).json({ message: 'Missing product ID or images' });
    }

    const product = await models.Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const productImages = await Promise.all(
      images.map(url => models.ProductImage.create({ product_id, image_url: url }))
    );

    res.status(201).json(productImages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
