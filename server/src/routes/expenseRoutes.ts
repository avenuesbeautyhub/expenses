import { Router } from 'express';
import { body, validationResult, query } from 'express-validator';
import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from '../controllers/expenseController';
import { protect } from '../middleware/auth';

const router = Router();

const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get(
  '/',
  protect,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('sortBy').optional().isIn(['date', 'amount', 'title']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
  ],
  handleValidationErrors,
  getExpenses
);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').isIn(['Food', 'Grocery', 'Fuel', 'Rent', 'Shopping', 'Entertainment', 'Medical', 'Education', 'EMI', 'Bills', 'Travel', 'Insurance', 'Gifts', 'Investment', 'Others']).withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('paymentMethod').isIn(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet', 'Others']).withMessage('Invalid payment method'),
    body('notes').optional().trim(),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  handleValidationErrors,
  createExpense
);

router.get('/:id', protect, getExpenseById);

router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').optional().isIn(['Food', 'Grocery', 'Fuel', 'Rent', 'Shopping', 'Entertainment', 'Medical', 'Education', 'EMI', 'Bills', 'Travel', 'Insurance', 'Gifts', 'Investment', 'Others']).withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('paymentMethod').optional().isIn(['Cash', 'UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Wallet', 'Others']).withMessage('Invalid payment method'),
    body('notes').optional().trim(),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  handleValidationErrors,
  updateExpense
);

router.delete('/:id', protect, deleteExpense);

export default router;
