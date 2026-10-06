const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'wholesale-super-secret-key-2026';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    let userQuery = User.findById(decoded.id);
    req.user = typeof userQuery.select === 'function' ? await userQuery.select('-__v') : await userQuery;
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

const dealerOnly = (req, res, next) => {
  if (req.user && req.user.role === 'dealer') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Forbidden: Dealer access required' });
  }
};

module.exports = { protect, dealerOnly, JWT_SECRET };
