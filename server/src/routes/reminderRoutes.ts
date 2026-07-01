import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { getReminders, getReminderById, createReminder, updateReminder, deleteReminder, getUpcomingReminders } from '../controllers/reminderController';
import { protect } from '../middleware/auth';

const router = Router();

const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', protect, getReminders);
router.get('/upcoming', protect, getUpcomingReminders);

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('dueDate').isISO8601().withMessage('Invalid date format'),
    body('category').isIn(['Rent', 'EMI', 'Utilities', 'Insurance', 'Subscription', 'Credit Card', 'Loan', 'Others']).withMessage('Invalid category'),
    body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
    body('recurringPeriod').optional().isIn(['monthly', 'yearly', 'weekly']).withMessage('Invalid recurring period'),
    body('notes').optional().trim(),
  ],
  handleValidationErrors,
  createReminder
);

router.get('/:id', protect, getReminderById);

router.put(
  '/:id',
  protect,
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
    body('category').optional().isIn(['Rent', 'EMI', 'Utilities', 'Insurance', 'Subscription', 'Credit Card', 'Loan', 'Others']).withMessage('Invalid category'),
    body('isRecurring').optional().isBoolean().withMessage('isRecurring must be a boolean'),
    body('recurringPeriod').optional().isIn(['monthly', 'yearly', 'weekly']).withMessage('Invalid recurring period'),
    body('notes').optional().trim(),
    body('isPaid').optional().isBoolean().withMessage('isPaid must be a boolean'),
  ],
  handleValidationErrors,
  updateReminder
);

router.delete('/:id', protect, deleteReminder);

export default router;
