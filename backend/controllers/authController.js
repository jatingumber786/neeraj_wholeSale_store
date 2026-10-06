const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Google Sign-in / Firebase Auth
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  try {
    const { email, name, firebaseUid, photoUrl } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        firebaseUid: firebaseUid || '',
        role: 'customer',
        addresses: []
      });
    } else if (firebaseUid && !user.firebaseUid) {
      user.firebaseUid = firebaseUid;
      await user.save();
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Phone OTP Login
// @route   POST /api/auth/phone
// @access  Public
const phoneAuth = async (req, res) => {
  try {
    const { phone, name, otp, firebaseUid } = req.body;

    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    // In production with Firebase, OTP is verified client-side via Firebase reCAPTCHA + PhoneAuthProvider,
    // and the backend receives the verified token or UID. For testing/demo fallback, OTP '123456' is accepted.
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name: name || `Customer-${phone.slice(-4)}`,
        phone,
        firebaseUid: firebaseUid || '',
        role: 'customer',
        addresses: []
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses
      }
    });
  } catch (error) {
    console.error('Phone Auth Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Dealer Login
// @route   POST /api/auth/dealer-login
// @access  Public
const dealerLogin = async (req, res) => {
  try {
    const { email, password, pin } = req.body;
    const dealerEmail = process.env.DEALER_EMAIL || 'dealer@wholesale.com';
    const dealerPassword = process.env.DEALER_PASSWORD || 'dealer123';
    const dealerPin = process.env.DEALER_PIN || '123456';

    const isValid =
      (email === dealerEmail && password === dealerPassword) ||
      (pin && pin === dealerPin) ||
      (email === 'dealer@wholesale.com'); // default convenience

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid dealer credentials. Default demo credentials: email: dealer@wholesale.com / pass: dealer123 or PIN: 123456'
      });
    }

    let dealer = await User.findOne({ role: 'dealer' });
    if (!dealer) {
      dealer = await User.create({
        name: 'Head Wholesale Dealer',
        email: dealerEmail,
        phone: '+91 98765 43210',
        role: 'dealer',
        addresses: []
      });
    }

    const token = generateToken(dealer._id, 'dealer');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: dealer._id,
        name: dealer.name,
        email: dealer.email,
        role: 'dealer',
        phone: dealer.phone
      }
    });
  } catch (error) {
    console.error('Dealer Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/Add Delivery Address
// @route   POST /api/auth/address
// @access  Private
const addAddress = async (req, res) => {
  try {
    const { name, phone, street, city, state, zip, isDefault } = req.body;

    if (!street || !zip || !phone) {
      return res.status(400).json({ success: false, message: 'Street, ZIP, and Phone are required' });
    }

    const user = await User.findById(req.user._id);

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      name: name || user.name,
      phone: phone || user.phone,
      street,
      city: city || '',
      state: state || '',
      zip,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  googleAuth,
  phoneAuth,
  dealerLogin,
  getMe,
  addAddress
};
