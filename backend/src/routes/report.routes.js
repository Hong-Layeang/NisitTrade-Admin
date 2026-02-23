import express from 'express';
import createProductReportController from '../controllers/report/create_product_report.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/', authMiddleware, createProductReportController); // POST /products/:productId/reports

export default router;
