import { Router } from 'express';
import { getDashboardData, getReports, getMonthlyTrend } from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/reports', protect, getReports);
router.get('/monthly-trend', protect, getMonthlyTrend);

export default router;
