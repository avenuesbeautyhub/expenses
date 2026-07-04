import { Router } from 'express';
import { body, validationResult, query } from 'express-validator';
import { getDebts, getDebtById, createDebt, updateDebt, returnDebt, deleteDebt } from '../controllers/debtController.js';
import { protect } from '../middleware/auth.js';

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
    query('sortBy').optional().isIn(['date', 'amount', 'title', 'dueDate']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
    query('type').optional().isIn(['borrow', 'return']).withMessage('Invalid debt type'),
    query('status').optional().isIn(['pending', 'partially_returned', 'returned']).withMessage('Invalid status'),
  ],
  handleValidationErrors,
  getDebts
);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('type').isIn(['borrow', 'return']).withMessage('Invalid debt type'),
    body('personName').trim().notEmpty().withMessage('Person name is required'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
    body('notes').optional().trim(),
  ],
  handleValidationErrors,
  createDebt
);

router.get('/:id', protect, getDebtById);

router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('type').optional().isIn(['borrow', 'return']).withMessage('Invalid debt type'),
    body('personName').optional().trim().notEmpty().withMessage('Person name cannot be empty'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('dueDate').optional().isISO8601().withMessage('Invalid due date format'),
    body('status').optional().isIn(['pending', 'partially_returned', 'returned']).withMessage('Invalid status'),
    body('notes').optional().trim(),
  ],
  handleValidationErrors,
  updateDebt
);

router.post(
  '/:id/return',
  protect,
  [
    body('returnedAmount').isFloat({ min: 0 }).withMessage('Returned amount must be a positive number'),
  ],
  handleValidationErrors,
  returnDebt
);

router.delete('/:id', protect, deleteDebt);

export default router;
