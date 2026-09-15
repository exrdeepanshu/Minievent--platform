const jwt              = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User             = require('../models/User');

/** Sign a JWT for a given user id */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

/** Shape the user object returned to the client (never expose password) */
const userResponse = (user) => ({
  id:        user._id,
  name:      user.name,
  email:     user.email,
  avatarUrl: user.avatarUrl,
  bio:       user.bio,
  createdAt: user.createdAt,
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res
        .status(409)
        .json({ error: 'An account with this email already exists.' });
    }

    const user  = await User.create({ name, email, password });
    const token = signToken(user._id);

    res.status(201).json({ token, user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Explicitly select password (it's excluded by default via `select: false`)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);
    res.json({ token, user: userResponse(user) });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/auth/me  (protected)
// ─────────────────────────────────────────────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(userResponse(user));
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/auth/profile  (protected)
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const patch = {};
    if (name !== undefined) patch.name = name;
    if (bio  !== undefined) patch.bio  = bio;

    const user = await User.findByIdAndUpdate(req.user.id, patch, {
      new: true, runValidators: true,
    });
    res.json(userResponse(user));
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, updateProfile };
