import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getBudgets, getBudgetById, createBudget, updateBudget, deleteBudget } from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', protect, getBudgets);

router.post(
  '/',
  protect,
  [
    body('category').isIn(['Food', 'Grocery', 'Fuel', 'Rent', 'Shopping', 'Entertainment', 'Medical', 'Education', 'EMI', 'Bills', 'Travel', 'Insurance', 'Gifts', 'Investment', 'Others']).withMessage('Invalid category'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    body('year').isInt({ min: 2020, max: 2100 }).withMessage('Year must be between 2020 and 2100'),
  ],
  handleValidationErrors,
  createBudget
);

router.get('/:id', protect, getBudgetById);

router.put(
  '/:id',
  protect,
  [
    body('category').optional().isIn(['Food', 'Grocery', 'Fuel', 'Rent', 'Shopping', 'Entertainment', 'Medical', 'Education', 'EMI', 'Bills', 'Travel', 'Insurance', 'Gifts', 'Investment', 'Others']).withMessage('Invalid category'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12'),
    body('year').optional().isInt({ min: 2020, max: 2100 }).withMessage('Year must be between 2020 and 2100'),
  ],
  handleValidationErrors,
  updateBudget
);

router.delete('/:id', protect, deleteBudget);

export default router;
