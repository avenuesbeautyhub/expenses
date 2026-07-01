import { Router } from 'express';
import { getFinancialInsights } from '../controllers/insightsController';
import { protect } from '../middleware/auth';

const router = Router();

router.get('/', protect, getFinancialInsights);

export default router;
