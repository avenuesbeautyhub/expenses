import { Router } from 'express';
import { getIncome, getIncomeById, createIncome, updateIncome, deleteIncome } from '../controllers/incomeController';
import { protect } from '../middleware/auth';

const router = Router();

router.route('/').get(protect, getIncome).post(protect, createIncome);
router.route('/:id').get(protect, getIncomeById).put(protect, updateIncome).delete(protect, deleteIncome);

export default router;
