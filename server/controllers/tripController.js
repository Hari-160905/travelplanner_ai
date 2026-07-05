import { validationResult } from 'express-validator';
import { createTrip, getTripById, updateTrip, deleteTrip, searchAndFilterTrips } from '../models/tripModel.js';

export const createNewTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { title, destination, startDate, endDate, budget, notes } = req.body;
    const trip = await createTrip({ userId: req.user.id, title, destination, startDate, endDate, budget, notes });
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
};

export const listTrips = async (req, res, next) => {
  try {
    const { search, destination, startDate, endDate, minBudget, maxBudget, limit, offset, sort } = req.query;
    const trips = await searchAndFilterTrips({
      userId: req.user.id,
      search,
      destination,
      startDate,
      endDate,
      minBudget: minBudget ? Number(minBudget) : undefined,
      maxBudget: maxBudget ? Number(maxBudget) : undefined,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0,
      sort,
    });
    res.json({ count: trips.length, trips });
  } catch (err) {
    next(err);
  }
};

export const getTrip = async (req, res, next) => {
  try {
    const trip = await getTripById(req.params.id, req.user.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const updateExistingTrip = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { title, destination, startDate, endDate, budget, notes } = req.body;
    const trip = await updateTrip({ tripId: req.params.id, userId: req.user.id, title, destination, startDate, endDate, budget, notes });
    if (!trip) return res.status(404).json({ message: 'Trip not found or not owned by user' });
    res.json(trip);
  } catch (err) {
    next(err);
  }
};

export const removeTrip = async (req, res, next) => {
  try {
    const success = await deleteTrip(req.params.id, req.user.id);
    if (!success) return res.status(404).json({ message: 'Trip not found or not owned by user' });
    res.json({ message: 'Trip deleted' });
  } catch (err) {
    next(err);
  }
};
