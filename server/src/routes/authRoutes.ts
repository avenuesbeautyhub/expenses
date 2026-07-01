import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword } from '../controllers/authController';
import { protect } from '../middleware/auth';

const router = Router();

const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']).withMessage('Invalid currency'),
    body('language').optional().isIn(['en', 'es', 'fr', 'de', 'hi']).withMessage('Invalid language'),
  ],
  handleValidationErrors,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  handleValidationErrors,
  login
);

router.get('/profile', protect, getProfile);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CAD', 'AUD']).withMessage('Invalid currency'),
    body('language').optional().isIn(['en', 'es', 'fr', 'de', 'hi']).withMessage('Invalid language'),
  ],
  handleValidationErrors,
  updateProfile
);

router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  handleValidationErrors,
  changePassword
);

router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Invalid email').normalizeEmail(),
  ],
  handleValidationErrors,
  forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  ],
  handleValidationErrors,
  resetPassword
);

export default router;
