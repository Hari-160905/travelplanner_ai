import express from 'express';
import { body, query } from 'express-validator';
import { protect } from '../middleware/jwtMiddleware.js';
import { addExpense, listExpenses, getExpense, editExpense, removeExpense, summary, monthlyReport, budgetRemaining } from '../controllers/expenseController.js';

const router = express.Router();

router.use(protect);

router.get('/',
  [
    query('tripId').optional({ nullable: true, checkFalsy: true }).isInt(),
    query('category').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('limit').optional().isInt({ min: 1 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  listExpenses
);

router.get('/summary', summary);
router.get('/monthly-report', monthlyReport);
router.get('/budget-remaining', budgetRemaining);

router.get('/:id', getExpense);

router.post(
  '/',
  body('tripId').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('currency').optional().isString(),
  body('description').optional().isString(),
  body('spentAt').isISO8601().withMessage('Valid date required'),
  addExpense
);

router.put(
  '/:id',
  body('tripId').optional({ nullable: true, checkFalsy: true }).isInt(),
  body('category').trim().notEmpty().withMessage('Category required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
  body('currency').optional().isString(),
  body('description').optional().isString(),
  body('spentAt').isISO8601().withMessage('Valid date required'),
  editExpense
);

router.delete('/:id', removeExpense);

export default router;
