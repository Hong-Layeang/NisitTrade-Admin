import models from '../../models/index.js';

const { Product } = models;

export default async function shareProductController(req, res) {
  try {
    const { id } = req.params;
    const requesterId = req.user?.id;
    const requesterRole = req.user?.role;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (product.status === 'hidden' && String(product.user_id) !== String(requesterId) && requesterRole !== 'admin') {
      return res.status(403).json({ message: 'You do not have permission to share this product' });
    }

    const baseUrl = process.env.SHARE_BASE_URL
      || process.env.CLIENT_URL
      || req.get('origin')
      || `${req.protocol}://${req.get('host')}`;

    const shareUrl = `${baseUrl}/products/${product.id}`;

    return res.json({
      product_id: product.id,
      title: product.title,
      share_url: shareUrl,
      share_text: `Check out this listing: ${product.title}`
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    return res.status(500).json({
      message: 'Failed to generate share link',
      error: error.message
    });
  }
}
