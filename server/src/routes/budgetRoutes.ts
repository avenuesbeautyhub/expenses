import { Router } from 'express';
import { getBudgets, getBudgetById, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController';
import { protect } from '../middleware/auth';

const router = Router();

router.route('/').get(protect, getBudgets).post(protect, createBudget);
router.route('/:id').get(protect, getBudgetById).put(protect, updateBudget).delete(protect, deleteBudget);

export default router;
