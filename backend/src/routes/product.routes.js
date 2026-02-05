import express from 'express';

import createProductController from '../controllers/product/create_product.controller.js';
import listProductsController from '../controllers/product/list_products.controller.js';
import getProductController from '../controllers/product/get_product.controller.js';
import updateProductController from '../controllers/product/update_product.controller.js';
import deleteProductController from '../controllers/product/delete_product.controller.js';
import addProductImagesController from '../controllers/product/add_product_images.controller.js';
import deleteProductImageController from '../controllers/product/delete_product_image.controller.js';
import updateProductStatusController from '../controllers/product/update_product_status.controller.js';

const router = express.Router();

// CRUD
router.post('/', createProductController); // post
router.get('/', listProductsController); // get
router.get('/:id', getProductController); // get
router.put('/:id', updateProductController); // put
router.delete('/:id', deleteProductController); // delete

// images (note: max images 8 enforced in controller)
router.post('/:id/images', addProductImagesController); // post
router.delete('/:id/images/:imageId', deleteProductImageController); // delete

// status
router.patch('/:id/status', updateProductStatusController); // patch

export default router;
