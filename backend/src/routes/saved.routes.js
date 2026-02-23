import express from 'express';
import createSavedListingController from '../controllers/saved/create_saved_listing.controller.js';
import deleteSavedListingController from '../controllers/saved/delete_saved_listing.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createSavedListingController); // POST /products/:productId/saves
router.delete('/', authMiddleware, deleteSavedListingController); // DELETE /products/:productId/saves

export default router;
