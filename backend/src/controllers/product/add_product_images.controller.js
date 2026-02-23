import models from '../../models/index.js';

const { Product, ProductImage, User, Category } = models;

const MAX_IMAGES = 8;

export default async function addProductImagesController(req, res) {
  try {
    const { id } = req.params;
    const { image_urls } = req.body; // Optional array of image URLs
    const user_id = req.user?.id;
    const user_role = req.user?.role;

    const uploadedUrls = Array.isArray(req.files)
      ? req.files.map(file => file.path)
      : [];

    const bodyUrls = Array.isArray(image_urls) ? image_urls : [];
    const urlsToSave = [...uploadedUrls, ...bodyUrls];

    if (urlsToSave.length === 0) {
      return res.status(400).json({ 
        message: 'At least one image is required' 
      });
    }

    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage }]
    });

    if (!product) {
      return res.status(404).json({ 
        message: 'Product not found' 
      });
    }

    // Check if user owns the product
    if (user_id && product.user_id !== user_id && user_role !== 'admin') {
      return res.status(403).json({ 
        message: 'You do not have permission to add images to this product' 
      });
    }

    // Check total image count
    const currentImageCount = product.ProductImages?.length || 0;
    const newImageCount = urlsToSave.length;
    
    if (currentImageCount + newImageCount > MAX_IMAGES) {
      return res.status(400).json({ 
        message: `Maximum ${MAX_IMAGES} images allowed. Current: ${currentImageCount}, Trying to add: ${newImageCount}` 
      });
    }

    // Create product images
    const imagePromises = urlsToSave.map(url => 
      ProductImage.create({
        product_id: id,
        image_url: url
      })
    );

    await Promise.all(imagePromises);

    // Fetch updated product with all associations
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

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error adding product images:', error);
    res.status(500).json({ 
      message: 'Failed to add product images',
      error: error.message 
    });
  }
}
