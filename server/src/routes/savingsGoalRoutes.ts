import { Router } from 'express';
import { body, validationResult, query } from 'express-validator';
import {
  getSavingsGoals,
  getSavingsGoalById,
  createSavingsGoal,
  updateSavingsGoal,
  addContribution,
  deleteSavingsGoal
} from '../controllers/savingsGoalController';
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
    query('sortBy').optional().isIn(['targetDate', 'targetAmount', 'currentAmount', 'title']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order'),
    query('status').optional().isIn(['active', 'completed', 'paused']).withMessage('Invalid status'),
  ],
  handleValidationErrors,
  getSavingsGoals
);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('targetAmount').isFloat({ min: 0 }).withMessage('Target amount must be a positive number'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('targetDate').isISO8601().withMessage('Invalid target date format'),
    body('description').optional().trim(),
  ],
  handleValidationErrors,
  createSavingsGoal
);

router.get('/:id', protect, getSavingsGoalById);

router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('targetAmount').optional().isFloat({ min: 0 }).withMessage('Target amount must be a positive number'),
    body('currentAmount').optional().isFloat({ min: 0 }).withMessage('Current amount must be a positive number'),
    body('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
    body('targetDate').optional().isISO8601().withMessage('Invalid target date format'),
    body('status').optional().isIn(['active', 'completed', 'paused']).withMessage('Invalid status'),
    body('description').optional().trim(),
  ],
  handleValidationErrors,
  updateSavingsGoal
);

router.post(
  '/:id/contribute',
  protect,
  [
    body('amount').isFloat({ min: 0 }).withMessage('Contribution amount must be a positive number'),
  ],
  handleValidationErrors,
  addContribution
);

router.delete('/:id', protect, deleteSavingsGoal);

export default router;
