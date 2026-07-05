import express from 'express';
import { body, query } from 'express-validator';
import { protect } from '../middleware/jwtMiddleware.js';
import { createNewTrip, listTrips, getTrip, updateExistingTrip, removeTrip } from '../controllers/tripController.js';

const router = express.Router();

router.use(protect);

router.get(
  '/',
  [
    query('search').optional().isString(),
    query('destination').optional().isString(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('minBudget').optional().isFloat({ min: 0 }),
    query('maxBudget').optional().isFloat({ min: 0 }),
    query('limit').optional().isInt({ min: 1, max: 1000 }),
    query('offset').optional().isInt({ min: 0 }),
  ],
  listTrips
);

router.get('/:id', getTrip);

router.post(
  '/',
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a number'),
  createNewTrip
);

router.put(
  '/:id',
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  body('budget').isFloat({ min: 0 }).withMessage('Budget must be a number'),
  updateExistingTrip
);

router.delete('/:id', removeTrip);

export default router;
