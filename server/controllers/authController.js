const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

exports.register = async (req, res) => {
  try {
    const { email, password, restaurantSlug, restaurantName } = req.body;
    if (!email || !password || !restaurantSlug) {
      return res.status(400).json({ error: 'Email, password, and restaurantSlug are required.' });
    }
    let restaurant = await Restaurant.findOne({ slug: restaurantSlug });
    if (!restaurant) {
      restaurant = await Restaurant.create({ name: restaurantName || restaurantSlug, slug: restaurantSlug });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered.' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, restaurantSlug, restaurantId: restaurant._id });
    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ userId: user._id, email: user.email, restaurantSlug: user.restaurantSlug, restaurantId: user.restaurantId }, JWT_SECRET, { expiresIn: '1d' });
    // Set cookie with proper settings for production
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, { 
      httpOnly: true, 
      sameSite: isProduction ? 'none' : 'lax', 
      secure: isProduction,
      maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.json({ restaurantSlug: user.restaurantSlug, restaurantId: user.restaurantId });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}; 