import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { createUser, findUserByEmail, findUserById } from '../models/userModel.js';

const createToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await createUser({ name, email, passwordHash });
    const token = createToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = createToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    // For stateless JWT, logout is client-side token removal. Return success.
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

export const profile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};
