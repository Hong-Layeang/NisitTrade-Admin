import models from '../../models/index.js';
import { enrichProductWithPresignedUrls } from '../../utils/s3-presigned-url.js';
import { writeActivityLog } from '../../utils/activity-log.js';

const { Product, ProductImage, User, Category } = models;

export default async function updateProductController(req, res) {
  try {
    const productId = parseInt(req.params.id, 10);
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check authorization - only owner or admin can update
    if (product.user_id !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { title, description, price, category_id, status, image_urls } = req.body;

    // Validate updates
    const updateData = {};
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      updateData.title = title.trim();
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }
    if (price !== undefined) {
      if (price <= 0) {
        return res.status(400).json({ error: 'Price must be greater than 0' });
      }
      updateData.price = price;
    }
    if (category_id !== undefined) {
      updateData.category_id = category_id;
    }
    if (status !== undefined) {
      const validStatuses = ['available', 'reserved', 'sold', 'hidden'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updateData.status = status;
    }

    // Update product
    const previousStatus = product.status;
    await product.update(updateData);

    // Update images if provided
    if (Array.isArray(image_urls) && image_urls.length > 0) {
      // Delete old images
      await ProductImage.destroy({ where: { product_id: productId } });
      // Create new images
      await ProductImage.bulkCreate(
        image_urls.map(url => ({
          product_id: productId,
          image_url: url,
        }))
      );
    }

    // Fetch updated product with relations
    const updatedProduct = await Product.findByPk(productId, {
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
          attributes: ['id', 'image_url', 'created_at', 'updated_at']
        }
      ]
    });

    const nextTitle = updatedProduct?.title || product.title;
    await writeActivityLog({
      actionType: 'product_updated',
      message: `Product updated: ${nextTitle}`,
      actorUserId: req.user?.id,
      actorRole: req.user?.role,
      targetType: 'Product',
      targetId: productId,
      metadata: { status: updatedProduct?.status || previousStatus },
    });

    if (previousStatus !== 'sold' && updatedProduct?.status === 'sold') {
      await writeActivityLog({
        actionType: 'product_marked_sold',
        message: `Product marked as sold: ${nextTitle}`,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        targetType: 'Product',
        targetId: productId,
      });
    }

    if (req.user?.role === 'admin') {
      await writeActivityLog({
        actionType: 'admin_updated_something',
        message: `Admin updated product: ${nextTitle}`,
        actorUserId: req.user?.id,
        actorRole: req.user?.role,
        targetType: 'Product',
        targetId: productId,
      });
    }

    const enrichedProduct = await enrichProductWithPresignedUrls(updatedProduct.toJSON());
    res.json(enrichedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    const status = error.message.includes('Access denied') ? 403 :
                   error.message.includes('not found') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
}
