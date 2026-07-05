import express from 'express';
import { body } from 'express-validator';
import { protect } from '../middleware/jwtMiddleware.js';
import { tripPlanner, packingList, budgetOptimizer, chat, history } from '../controllers/aiController.js';

const router = express.Router();
router.use(protect);

router.post(
  '/trip-planner',
  body('destination').notEmpty(),
  body('budget').isFloat({ min: 0 }),
  body('days').isInt({ min: 1 }),
  body('interests').notEmpty(),
  tripPlanner
);

router.post('/packing-list', body('destination').notEmpty(), body('season').notEmpty(), packingList);
router.post('/budget-optimizer', body('budget').isFloat({ min: 0 }), body('currentExpenses').isArray(), budgetOptimizer);
router.post('/chat', body('question').notEmpty(), chat);
router.get('/history', history);

export default router;
