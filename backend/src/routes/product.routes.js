import express from 'express';

import createProductController from '../controllers/product/create_product.controller.js';
import listProductsController from '../controllers/product/list_products.controller.js';
import getProductController from '../controllers/product/get_product.controller.js';
import updateProductController from '../controllers/product/update_product.controller.js';
import deleteProductController from '../controllers/product/delete_product.controller.js';
import addProductImagesController from '../controllers/product/add_product_images.controller.js';
import deleteProductImageController from '../controllers/product/delete_product_image.controller.js';
import updateProductStatusController from '../controllers/product/update_product_status.controller.js';
import shareProductController from '../controllers/product/share_product.controller.js';
import hideProductController from '../controllers/product/hide_product.controller.js';
import unhideProductController from '../controllers/product/unhide_product.controller.js';
import likeRoutes from '../routes/like.routes.js';
import commentRoutes from '../routes/comment.routes.js';
import savedRoutes from '../routes/saved.routes.js';
import reportRoutes from '../routes/report.routes.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { uploadProductImages } from '../middlewares/upload.middleware.js';

const router = express.Router();

// CRUD
router.post('/', authMiddleware, createProductController); // post
router.get('/', authMiddleware, listProductsController); // get
router.get('/:id', authMiddleware, getProductController); // get
router.put('/:id', authMiddleware, updateProductController); // put
router.delete('/:id', authMiddleware, deleteProductController); // delete

// images (note: max images 8 enforced in controller)
router.post('/:id/images', authMiddleware, uploadProductImages, addProductImagesController); // post
router.delete('/:id/images/:imageId', authMiddleware, deleteProductImageController); // delete

// status
router.patch('/:id/status', authMiddleware, updateProductStatusController); // patch

// hide/unhide
router.patch('/:id/hide', authMiddleware, hideProductController); // patch
router.patch('/:id/unhide', authMiddleware, unhideProductController); // patch

// share
router.get('/:id/share', authMiddleware, shareProductController); // get

// Nested routes for likes and comments
router.use('/:productId/likes', likeRoutes);
router.use('/:productId/comments', commentRoutes);
router.use('/:productId/saves', savedRoutes);
router.use('/:productId/reports', reportRoutes);

export default router;
