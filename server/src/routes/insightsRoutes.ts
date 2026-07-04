import { Router } from 'express';
import { getFinancialInsights } from '../controllers/insightsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, getFinancialInsights);

export default router;
