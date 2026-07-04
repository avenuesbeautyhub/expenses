import { Router } from 'express';
import { getDashboardData, getReports, getMonthlyTrend } from '../controllers/analyticsController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/dashboard', protect, getDashboardData);
router.get('/reports', protect, getReports);
router.get('/monthly-trend', protect, getMonthlyTrend);

export default router;
