import express from 'express';
import listProductReportsController from '../controllers/report/list_product_reports.controller.js';
import updateProductReportStatusController from '../controllers/report/update_product_report_status.controller.js';
import { authMiddleware, requireRole } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, requireRole('admin'), listProductReportsController); // GET /reports
router.patch('/:id/status', authMiddleware, requireRole('admin'), updateProductReportStatusController); // PATCH /reports/:id/status

export default router;
