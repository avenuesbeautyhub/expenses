import { Router } from 'express';
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController';
import { protect } from '../middleware/auth';

const router = Router();

router.route('/').get(protect, getExpenses).post(protect, createExpense);
router.route('/:id').get(protect, getExpenseById).put(protect, updateExpense).delete(protect, deleteExpense);

export default router;
