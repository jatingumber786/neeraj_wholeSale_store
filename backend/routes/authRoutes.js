const express = require('express');
const router = express.Router();
const {
  googleAuth,
  phoneAuth,
  dealerLogin,
  getMe,
  addAddress
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/google', googleAuth);
router.post('/phone', phoneAuth);
router.post('/dealer-login', dealerLogin);
router.get('/me', protect, getMe);
router.post('/address', protect, addAddress);

module.exports = router;
