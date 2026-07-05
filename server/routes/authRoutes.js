import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, profile } from '../controllers/authController.js';
import { protect } from '../middleware/jwtMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password min 6 chars'),
  register
);

router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  login
);

router.post('/logout', protect, logout);
router.get('/profile', protect, profile);

export default router;
