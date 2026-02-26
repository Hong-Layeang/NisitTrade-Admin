import express from 'express';

import listCategoriesController from '../controllers/category/list_categories.controller.js';
import getCategoryController from '../controllers/category/get_category.controller.js';
import createCategoryController from '../controllers/category/create_category.controller.js';
import updateCategoryController from '../controllers/category/update_category.controller.js';
import deleteCategoryController from '../controllers/category/delete_category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, listCategoriesController); // get
router.get('/:id', authMiddleware, getCategoryController); // get

// admin only
router.post('/', authMiddleware, requireRole('admin'), createCategoryController); // post
router.put('/:id', authMiddleware, requireRole('admin'), updateCategoryController); // put
router.delete('/:id', authMiddleware, requireRole('admin'), deleteCategoryController); // delete

export default router;
