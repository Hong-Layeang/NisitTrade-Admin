import express from 'express';

import listCategoriesController from '../controllers/category/list_categories.controller.js';
import getCategoryController from '../controllers/category/get_category.controller.js';
import createCategoryController from '../controllers/category/create_category.controller.js';
import updateCategoryController from '../controllers/category/update_category.controller.js';
import deleteCategoryController from '../controllers/category/delete_category.controller.js';

const router = express.Router();

router.get('/', listCategoriesController); // get
router.get('/:id', getCategoryController); // get

// admin only
router.post('/', createCategoryController); // post
router.put('/:id', updateCategoryController); // put
router.delete('/:id', deleteCategoryController); // delete

export default router;
