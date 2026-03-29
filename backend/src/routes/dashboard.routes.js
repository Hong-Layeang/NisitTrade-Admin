import express from 'express';
import getDashboardSummaryController from '../controllers/dashboard/get_dashboard_summary.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = express.Router();

router.get('/summary', authMiddleware, requireRole('admin'), getDashboardSummaryController);

export default router;
