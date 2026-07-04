import { Router } from 'express';
import { body, validationResult, query } from 'express-validator';
import { getIncome, getIncomeById, createIncome, updateIncome, deleteIncome } from '../controllers/incomeController';
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
  getIncome
);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('source').isIn(['Salary', 'Business', 'Freelance', 'Bonus', 'Investment', 'Others']).withMessage('Invalid source'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('notes').optional().trim(),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  handleValidationErrors,
  createIncome
);

router.get('/:id', protect, getIncomeById);

router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('source').optional().isIn(['Salary', 'Business', 'Freelance', 'Bonus', 'Investment', 'Others']).withMessage('Invalid source'),
    body('date').optional().isISO8601().withMessage('Invalid date format'),
    body('notes').optional().trim(),
    body('tags').optional().isArray().withMessage('Tags must be an array'),
  ],
  handleValidationErrors,
  updateIncome
);

router.delete('/:id', protect, deleteIncome);

export default router;
