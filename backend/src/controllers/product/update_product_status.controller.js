import models from '../../models/index.js';
import { writeActivityLog } from '../../utils/activity-log.js';

const { Product, User, Category, ProductImage } = models;

const VALID_STATUSES = ['available', 'reserved', 'sold', 'hidden'];

export default async function updateProductStatusController(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user?.id;
    const user_role = req.user?.role;

    if (!status) {
      return res.status(400).json({ 
        message: 'Status is required' 
      });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ 
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}` 
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    // Check if user owns the product
    if (user_id && product.user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ 
        message: 'You do not have permission to update this product status' 
      });
    }

    const previousStatus = product.status;
    await product.update({ status });

    // Fetch updated product with associations
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: User,
          attributes: ['id', 'full_name', 'email', 'profile_image', 'provider', 'role', 'university_id', 'created_at', 'updated_at']
        },
        {
          model: Category,
          attributes: ['id', 'name', 'created_at', 'updated_at']
        },
        {
          model: ProductImage,
          attributes: ['id', 'image_url', 'product_id', 'created_at', 'updated_at']
        }
      ]
    });

    const actor = user_id
      ? await User.findByPk(user_id, {
          attributes: ['full_name'],
          raw: true,
        })
      : null;
    const actorPrefix = req.user?.role === 'admin' ? 'Admin' : 'User';
    const actorName = actor?.full_name?.trim();
    const actorLabel = actorName ? `${actorPrefix} ${actorName}` : actorPrefix;

    await writeActivityLog({
      actionType: 'product_updated',
      message: `${actorLabel} updated product: ${updatedProduct?.title || 'Untitled'}`,
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      targetType: 'Product',
      targetId: Number(id),
      metadata: { previousStatus, status },
    });

    if (previousStatus !== 'sold' && status === 'sold') {
      await writeActivityLog({
        actionType: 'product_marked_sold',
        message: `Product marked as sold: ${updatedProduct?.title || 'Untitled'}`,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        targetType: 'Product',
        targetId: Number(id),
      });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product status:', error);
    res.status(500).json({ 
      message: 'Failed to update product status',
      error: error.message 
    });
  }
}
