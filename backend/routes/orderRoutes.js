const express = require('express');
const router = express.Router();
const {
  placeOrder,
  getTodayOrders,
  getMyOrders,
  getDealerStats
} = require('../controllers/orderController');
const { protect, dealerOnly } = require('../middleware/authMiddleware');

// Optional auth for placing order: logged-in user gets customerId attached, guests can order with phone/address
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('../middleware/authMiddleware');
      const decoded = jwt.verify(token, JWT_SECRET);
      const User = require('../models/User');
      User.findById(decoded.id).then((u) => {
        req.user = u;
        next();
      }).catch(() => next());
      return;
    } catch (e) {
      // ignore
    }
  }
  next();
};

router.post('/', optionalAuth, placeOrder);
router.get('/today', protect, dealerOnly, getTodayOrders);
router.get('/my-orders', optionalAuth, getMyOrders);
router.get('/stats', protect, dealerOnly, getDealerStats);

module.exports = router;
