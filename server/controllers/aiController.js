import { validationResult } from 'express-validator';
import geminiService from '../services/geminiService.js';
import { saveAIHistory, getAIHistoryByUser } from '../models/aiModel.js';

export const tripPlanner = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { destination, budget, days, interests } = req.body;
    const payload = { destination, budget, days, interests };
    const prompt = geminiService.getPromptForType('tripPlanner', payload);
    const result = await geminiService.generateTripPlanner(payload);
    await saveAIHistory({ userId: req.user.id, type: 'tripPlanner', inputPayload: payload, responseText: result });
    res.json({ prompt, result });
  } catch (err) {
    next(err);
  }
};

export const packingList = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { destination, season } = req.body;
    const payload = { destination, season };
    const prompt = geminiService.getPromptForType('packingList', payload);
    const result = await geminiService.generatePackingList(payload);
    await saveAIHistory({ userId: req.user.id, type: 'packingList', inputPayload: payload, responseText: result });
    res.json({ prompt, result });
  } catch (err) {
    next(err);
  }
};

export const budgetOptimizer = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { currentExpenses, budget } = req.body;
    const payload = { currentExpenses, budget };
    const prompt = geminiService.getPromptForType('budgetOptimizer', payload);
    const result = await geminiService.generateBudgetOptimizer(payload);
    await saveAIHistory({ userId: req.user.id, type: 'budgetOptimizer', inputPayload: payload, responseText: result });
    res.json({ prompt, result });
  } catch (err) {
    next(err);
  }
};

export const chat = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { question } = req.body;
    const payload = { question };
    const prompt = geminiService.getPromptForType('chatAssistant', payload);
    const result = await geminiService.chatAssistant(question);
    await saveAIHistory({ userId: req.user.id, type: 'chatAssistant', inputPayload: payload, responseText: result });
    res.json({ prompt, result });
  } catch (err) {
    next(err);
  }
};

export const history = async (req, res, next) => {
  try {
    const items = await getAIHistoryByUser(req.user.id, req.query.limit || 100);
    res.json(items);
  } catch (err) {
    next(err);
  }
};
